var peliasQuery = require('pelias-query'),
    defaults = require('./search_defaults'),
    textParser = require('./text_parser'),
    check = require('check-types'),
    geolib = require('geolib'),
    viewsToQuery = require('./views_to_query'),
    _ = require('lodash');

//------------------------------
// general-purpose search query
//------------------------------
var query = new peliasQuery.layout.FilteredBooleanQuery();

var views;
var api = require('pelias-config').generate().api;
if (api && api.query && api.query.search) {
  // external config for views
  views = api.query.search.views;

  // merge external defaults if available
  if(api.query.search.defaults) {
    defaults = _.merge({}, defaults, api.query.search.defaults);
  }
}

if (!views) {
  // Get default view configuration
  views = require( './search_views.json' );
}

// add defined views to the query
viewsToQuery(views, query, peliasQuery.view);

/**
  map request variables to query variables for all inputs
  provided by this HTTP request.
**/
function generateQuery( clean ){

  var vs = new peliasQuery.Vars( defaults );

  // input text
  vs.var( 'input:name', clean.text );

  vs.var( 'sources', clean.sources);

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

  // focus viewport
  if( check.number(clean['focus.viewport.min_lat']) &&
      check.number(clean['focus.viewport.max_lat']) &&
      check.number(clean['focus.viewport.min_lon']) &&
      check.number(clean['focus.viewport.max_lon']) ) {
    // calculate the centroid from the viewport box
    vs.set({
      'focus:point:lat': clean['focus.viewport.min_lat'] + ( clean['focus.viewport.max_lat'] - clean['focus.viewport.min_lat'] ) / 2,
      'focus:point:lon': clean['focus.viewport.min_lon'] + ( clean['focus.viewport.max_lon'] - clean['focus.viewport.min_lon'] ) / 2
      //, 'focus:scale': calculateDiagonalDistance(clean) + 'km'
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

  return query.render( vs );
}

// return diagonal distance in km, with min=1
function calculateDiagonalDistance(clean) {
  var diagonalDistance = geolib.getDistance(
    { latitude: clean['focus.viewport.min_lat'], longitude: clean['focus.viewport.min_lon'] },
    { latitude: clean['focus.viewport.max_lat'], longitude: clean['focus.viewport.max_lon'] },
    1000
  ) / 1000;

  return Math.max(diagonalDistance, 1);

}

module.exports = generateQuery;
