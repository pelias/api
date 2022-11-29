const _ = require('lodash');
const peliasQuery = require('pelias-query');
const defaults = require('./search_defaults');
const textParser = require('./text_parser');
const config = require('pelias-config').generate();
const addendum_namespace_filter = require('./view/addendum_namespace_filter');

//------------------------------
// general-purpose search query
//------------------------------
const structuredQuery = new peliasQuery.layout.StructuredFallbackQuery();

// scoring boost
structuredQuery.score( peliasQuery.view.focus_only_function( ) );
structuredQuery.score( peliasQuery.view.popularity_only_function );
structuredQuery.score( peliasQuery.view.population_only_function );
// --------------------------------

// non-scoring hard filters
structuredQuery.filter( peliasQuery.view.leaf.multi_match('boundary_country') );
structuredQuery.filter( peliasQuery.view.boundary_circle );
structuredQuery.filter( peliasQuery.view.boundary_rect );
structuredQuery.filter( peliasQuery.view.sources );
structuredQuery.filter( peliasQuery.view.layers );
structuredQuery.filter( peliasQuery.view.categories );
structuredQuery.filter( peliasQuery.view.boundary_gid );

const configuredAddendumNamespaces = config.get('addendum_namespaces');
Object.keys(configuredAddendumNamespaces).forEach(namespace => {
  structuredQuery.filter( addendum_namespace_filter(namespace) );
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
  vs.var( 'sources', clean.sources);

  // layers
  vs.var( 'layers', clean.layers);

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
  return {
    type: 'structured',
    body: structuredQuery.render(vs)
  };
}

module.exports = generateQuery;
