var peliasQuery = require('pelias-query'),
    defaults = require('./search_defaults'),
    textParser = require('./text_parser'),
    check = require('check-types');

//------------------------------
// general-purpose search query
//------------------------------
var fallbackQuery = new peliasQuery.layout.FallbackQuery();
var geodisambiguationQuery = new peliasQuery.layout.GeodisambiguationQuery();

// scoring boost
fallbackQuery.score( peliasQuery.view.focus_only_function( peliasQuery.view.phrase ) );
fallbackQuery.score( peliasQuery.view.popularity_only_function );
fallbackQuery.score( peliasQuery.view.population_only_function );

geodisambiguationQuery.score( peliasQuery.view.focus_only_function( peliasQuery.view.phrase ) );
geodisambiguationQuery.score( peliasQuery.view.popularity_only_function );
geodisambiguationQuery.score( peliasQuery.view.population_only_function );
// --------------------------------

// non-scoring hard filters
fallbackQuery.filter( peliasQuery.view.boundary_country );
fallbackQuery.filter( peliasQuery.view.boundary_circle );
fallbackQuery.filter( peliasQuery.view.boundary_rect );
fallbackQuery.filter( peliasQuery.view.sources );
fallbackQuery.filter( peliasQuery.view.layers );
fallbackQuery.filter( peliasQuery.view.categories );

geodisambiguationQuery.filter( peliasQuery.view.boundary_country );
geodisambiguationQuery.filter( peliasQuery.view.boundary_circle );
geodisambiguationQuery.filter( peliasQuery.view.boundary_rect );
geodisambiguationQuery.filter( peliasQuery.view.sources );
geodisambiguationQuery.filter( peliasQuery.view.layers );
geodisambiguationQuery.filter( peliasQuery.view.categories );
// --------------------------------

/**
  map request variables to query variables for all inputs
  provided by this HTTP request.
**/
function generateQuery( clean ){

  var vs = new peliasQuery.Vars( defaults );

  // input text
  vs.var( 'input:name', clean.text );

  // sources
  vs.var( 'sources', clean.sources);

  // layers
  vs.var( 'layers', clean.layers);

  // categories
  if (clean.categories) {
    vs.var('input:categories', clean.categories);
  }

  // size
  if( clean.querySize ) {
    vs.var( 'size', clean.querySize );
  }

  // focus point
  if( check.number(clean['focus.point.lat']) &&
      check.number(clean['focus.point.lon']) ){
    vs.set({
      'focus:point:lat': clean['focus.point.lat'],
      'focus:point:lon': clean['focus.point.lon']
    });
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
  }

  // boundary country
  if( check.string(clean['boundary.country']) ){
    vs.set({
      'boundary:country': clean['boundary.country']
    });
  }

  // run the address parser
  if( clean.parsed_text ){
    textParser( clean.parsed_text, vs );
  }

  var q = getQuery(vs);

  //console.log(JSON.stringify(q, null, 2));

  return q;
}

function getQuery(vs) {
  if (isSingleFieldGeoambiguity(vs) && !hasQueryOrAddress(vs)) {
    // return `undefined` for now until we exorcise the geodisambiguation demons
    return;
  } else {
    return fallbackQuery.render(vs);
  }

}

function isSingleFieldGeoambiguity(vs) {
  return ['neighbourhood', 'borough', 'locality', 'county', 'region', 'country'].filter(function(layer) {
    return vs.isset('input:' + layer);
  }).length === 1;
}

function hasQueryOrAddress(vs) {
  return ['housenumber', 'street', 'query', 'category'].filter(function(layer) {
    return vs.isset('input:' + layer);
  }).length > 0;
}

module.exports = generateQuery;
