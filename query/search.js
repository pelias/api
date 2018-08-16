const peliasQuery = require('pelias-query');
const defaults = require('./search_defaults');
const textParser = require('./text_parser');
const check = require('check-types');
const logger = require('pelias-logger').get('api');

//------------------------------
// general-purpose search query
//------------------------------
var fallbackQuery = new peliasQuery.layout.FallbackQuery();

// scoring boost
fallbackQuery.score( peliasQuery.view.focus_only_function( peliasQuery.view.phrase ) );
fallbackQuery.score( peliasQuery.view.popularity_only_function );
fallbackQuery.score( peliasQuery.view.population_only_function );
// --------------------------------

// non-scoring hard filters
fallbackQuery.filter( peliasQuery.view.boundary_country );
fallbackQuery.filter( peliasQuery.view.boundary_circle );
fallbackQuery.filter( peliasQuery.view.boundary_rect );
fallbackQuery.filter( peliasQuery.view.sources );
fallbackQuery.filter( peliasQuery.view.layers );
fallbackQuery.filter( peliasQuery.view.categories );
// --------------------------------

/**
  map request variables to query variables for all inputs
  provided by this HTTP request.
**/
function generateQuery( clean ){

  const vs = new peliasQuery.Vars( defaults );

  let logStr = '[query:search] [parser:libpostal] ';

  // input text
  vs.var( 'input:name', clean.text );

  // sources
  if( check.array(clean.sources) && clean.sources.length ) {
    vs.var( 'sources', clean.sources);
    logStr += '[param:sources] ';
  }

  // layers
  if( check.array(clean.layers) && clean.layers.length ) {
    vs.var('layers', clean.layers);
    logStr += '[param:layers] ';
  }

  // categories
  if (clean.categories) {
    vs.var('input:categories', clean.categories);
    logStr += '[param:categories] ';
  }

  // size
  if( clean.querySize ) {
    vs.var( 'size', clean.querySize );
    logStr += '[param:querySize] ';
  }

  // focus point
  if( check.number(clean['focus.point.lat']) &&
      check.number(clean['focus.point.lon']) ){
    vs.set({
      'focus:point:lat': clean['focus.point.lat'],
      'focus:point:lon': clean['focus.point.lon']
    });
    logStr += '[param:focus_point] ';
  }

  // boundary rect
  if( check.number(clean['boundary.rect.min_lat']) &&
      check.number(clean['boundary.rect.max_lat']) &&
      check.number(clean['boundary.rect.min_lon']) &&
      check.number(clean['boundary.rect.max_lon']) ){
    vs.set({
      'boundary:rect:top': clean['boundary.rect.max_lat'],
      'boundary:rect:right': clean['boundary.rect.max_lon'],
      'boundary:rect:bottom': clean['boundary.rect.min_lat'],
      'boundary:rect:left': clean['boundary.rect.min_lon']
    });
    logStr += '[param:boundary_rect] ';
  }

  // boundary circle
  // @todo: change these to the correct request variable names
  if( check.number(clean['boundary.circle.lat']) &&
      check.number(clean['boundary.circle.lon']) ){
    vs.set({
      'boundary:circle:lat': clean['boundary.circle.lat'],
      'boundary:circle:lon': clean['boundary.circle.lon']
    });

    if( check.number(clean['boundary.circle.radius']) ){
      vs.set({
        'boundary:circle:radius': Math.round( clean['boundary.circle.radius'] ) + 'km'
      });
    }
    logStr += '[param:boundary_circle] ';
  }

  // boundary country
  if( check.string(clean['boundary.country']) ){
    vs.set({
      'boundary:country': clean['boundary.country']
    });
    logStr += '[param:boundary_country] ';
  }

  // run the address parser
  if( clean.parsed_text ){
    textParser( clean.parsed_text, vs );
  }

  var q = getQuery(vs);

  //console.log(JSON.stringify(q, null, 2));

  if (q !== undefined) {
    logger.debug(logStr);
  }
  else {
    logger.debug('[parser:libpostal] query type not supported');
  }

  return q;
}

function getQuery(vs) {

  logger.info(`[query:search] [search_input_type:${determineQueryType(vs)}]`);

  if (hasStreet(vs) || isPostalCodeOnly(vs) || isPostalCodeWithCountry(vs)) {
    return {
      type: 'fallback',
      body: fallbackQuery.render(vs)
    };
  }

  // returning undefined is a signal to a later step that the addressit-parsed
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


function isPostalCodeWithCountry(vs) {
    var isSet = (layer) => {
        return vs.isset(`input:${layer}`);
    };
    
    var allowedFields = ['postcode', 'country'];
    var disallowedFields = ['query', 'category', 'housenumber', 'street', 'locality',
                          'neighbourhood', 'borough', 'county', 'region'];
        
    return allowedFields.every(isSet) &&
        !disallowedFields.some(isSet);
}

module.exports = generateQuery;
