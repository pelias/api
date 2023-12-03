const _ = require('lodash');
const peliasQuery = require('pelias-query');
const defaults = require('./search_defaults');
const textParser = require('./text_parser');
const config = require('pelias-config').generate();
const addendum_namespace_filter = require('./view/addendum_namespace_filter');

//------------------------------
// general-purpose search query
//------------------------------
var fallbackQuery = new peliasQuery.layout.FallbackQuery();

// scoring boost
fallbackQuery.score( peliasQuery.view.focus_only_function( ) );
fallbackQuery.score( peliasQuery.view.popularity_only_function );
fallbackQuery.score( peliasQuery.view.population_only_function );
// --------------------------------

// non-scoring hard filters
fallbackQuery.filter( peliasQuery.view.leaf.multi_match('boundary_country') );
fallbackQuery.filter( peliasQuery.view.boundary_circle );
fallbackQuery.filter( peliasQuery.view.boundary_rect );
fallbackQuery.filter( peliasQuery.view.sources );
fallbackQuery.filter( peliasQuery.view.layers );
fallbackQuery.filter( peliasQuery.view.categories );
fallbackQuery.filter( peliasQuery.view.boundary_gid );

const configuredAddendumNamespaces = config.get('addendum_namespaces');
Object.keys(configuredAddendumNamespaces).forEach(namespace => {
  fallbackQuery.filter( addendum_namespace_filter(namespace, configuredAddendumNamespaces[namespace].type) );
});

// --------------------------------

/**
  map request variables to query variables for all inputs
  provided by this HTTP request.
**/
function generateQuery( clean ){

  const vs = new peliasQuery.Vars( defaults );


  // input text
  vs.var( 'input:name', clean.text );

  //addendum
  const configuredAddendumNamespaces = config.get('addendum_namespaces');
  Object.keys(configuredAddendumNamespaces)
    .filter(namespace => clean[namespace])
    .forEach(namespace => {
      vs.var( namespace, clean[namespace] );
    });

  // sources
  if( _.isArray(clean.sources) && !_.isEmpty(clean.sources) ) {
    vs.var( 'sources', clean.sources);
  }

  // layers
  if( _.isArray(clean.layers) && !_.isEmpty(clean.layers) ) {
    vs.var('layers', clean.layers);
  }

  // categories
  if (clean.categories && !_.isEmpty(clean.categories)) {
    vs.var('input:categories', clean.categories);
  }

  // size
  if( clean.querySize ) {
    vs.var( 'size', clean.querySize );
  }

  // focus point
  if( _.isFinite(clean['focus.point.lat']) &&
      _.isFinite(clean['focus.point.lon']) ){
    vs.set({
      'focus:point:lat': clean['focus.point.lat'],
      'focus:point:lon': clean['focus.point.lon']
    });
  }

  // boundary rect
  if( _.isFinite(clean['boundary.rect.min_lat']) &&
      _.isFinite(clean['boundary.rect.max_lat']) &&
      _.isFinite(clean['boundary.rect.min_lon']) &&
      _.isFinite(clean['boundary.rect.max_lon']) ){
    vs.set({
      'boundary:rect:top': clean['boundary.rect.max_lat'],
      'boundary:rect:right': clean['boundary.rect.max_lon'],
      'boundary:rect:bottom': clean['boundary.rect.min_lat'],
      'boundary:rect:left': clean['boundary.rect.min_lon']
    });
  }

  // boundary circle
  // @todo: change these to the correct request variable names
  if( _.isFinite(clean['boundary.circle.lat']) &&
      _.isFinite(clean['boundary.circle.lon']) ){
    vs.set({
      'boundary:circle:lat': clean['boundary.circle.lat'],
      'boundary:circle:lon': clean['boundary.circle.lon']
    });

    if( _.isFinite(clean['boundary.circle.radius']) ){
      vs.set({
        'boundary:circle:radius': Math.round( clean['boundary.circle.radius'] ) + 'km'
      });
    }
  }

  // boundary country
  if( _.isArray(clean['boundary.country']) && !_.isEmpty(clean['boundary.country']) ){
    vs.set({
      'multi_match:boundary_country:input': clean['boundary.country'].join(' ')
    });
  }

  // boundary gid
  if ( _.isString(clean['boundary.gid']) ){
    vs.set({
      'boundary:gid': clean['boundary.gid']
    });
  }

  // run the address parser
  if( clean.parsed_text ){
    textParser( clean.parsed_text, vs );
  }

  return getQuery(vs);
}

function getQuery(vs) {
  if (hasStreet(vs) || isPostalCodeOnly(vs) || isPostalCodeWithAdmin(vs)) {
    return {
      type: 'search_fallback',
      body: fallbackQuery.render(vs)
    };
  }

  // returning undefined is a signal to a later step that a fallback parser
  // query should be queried for
  return undefined;

}

function determineQueryType(vs) {
  if (vs.isset('input:housenumber') && vs.isset('input:street')) {
    return 'address';
  }
  else if (vs.isset('input:street')) {
    return 'street';
  }
  else if (vs.isset('input:query')) {
    return 'venue';
  }
  else if (['neighbourhood', 'borough', 'postcode', 'county', 'region','country'].some(
    layer => vs.isset(`input:${layer}`)
  )) {
    return 'admin';
  }
  return 'other';
}

function hasStreet(vs) {
  return vs.isset('input:street');
}

function isPostalCodeOnly(vs) {
  var isSet = layer => vs.isset(`input:${layer}`);

  var allowedFields = ['postcode'];
  var disallowedFields = ['query', 'category', 'housenumber', 'street',
    'neighbourhood', 'borough', 'county', 'region', 'country'];

  return allowedFields.every(isSet) &&
    !disallowedFields.some(isSet);
}


function isPostalCodeWithAdmin(vs) {
    var isSet = (layer) => {
        return vs.isset(`input:${layer}`);
    };

    var disallowedFields = ['query', 'category', 'housenumber', 'street'];

    return isSet('postcode') &&
      !disallowedFields.some(isSet);
}

module.exports = generateQuery;
