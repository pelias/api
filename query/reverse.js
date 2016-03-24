var peliasQuery = require('pelias-query'),
    defaults = require('./reverse_defaults'),
    check = require('check-types'),
    viewsToQuery = require('./views_to_query'),
    _ = require('lodash');

//------------------------------
// reverse geocode query
//------------------------------
var query = new peliasQuery.layout.FilteredBooleanQuery();

var views;
var api = require('pelias-config').generate().api;
if (api && api.query && api.query.reverse) {
  // external config for views
  views = api.query.reverse.views;

  // external default values
  if(api.query.reverse.defaults) {
    defaults = _.merge({}, defaults, api.query.reverse.defaults);
  }
}

if(!views){  // get default view configuration
  views = require( './reverse_views.json' );
}

// add defined views to the query
viewsToQuery(views, query, peliasQuery.view);

// --------------------------------

function generateQuery( clean ){

  var vs = new peliasQuery.Vars( defaults );

  // set size
  if( clean.querySize ){
    vs.var( 'size', clean.querySize);
  }

  // focus point to score by distance
  if( check.number(clean['point.lat']) &&
      check.number(clean['point.lon']) ){
    vs.set({
      'focus:point:lat': clean['point.lat'],
      'focus:point:lon': clean['point.lon']
    });
  }

  // bounding circle
  // note: the sanitizers will take care of the case
  // where point.lan/point.lon are provided in the
  // absense of boundary.circle.lat/boundary.circle.lon
  if( check.number(clean['boundary.circle.lat']) &&
      check.number(clean['boundary.circle.lon']) &&
      check.number(clean['boundary.circle.radius']) ){
    vs.set({
      'boundary:circle:lat': clean['boundary.circle.lat'],
      'boundary:circle:lon': clean['boundary.circle.lon'],
      'boundary:circle:radius': clean['boundary.circle.radius'] + 'km'
    });
  }

  // boundary country
  if( check.string(clean['boundary.country']) ){
    vs.set({
      'boundary:country': clean['boundary.country']
    });
  }

  return query.render( vs );
}

module.exports = generateQuery;
