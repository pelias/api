'use strict';

const peliasQuery = require('pelias-query');
const check = require('check-types');
const logger = require('pelias-logger').get('api');
const _ = require('lodash');

var defaults = require('./reverse_defaults');

const api = require('pelias-config').generate().api;
if (api && api.query && api.query.reverse && api.query.reverse.defaults) {
  // merge external defaults if available
  defaults = _.merge({}, defaults, api.query.reverse.defaults);
}

//------------------------------
// reverse geocode query
//------------------------------
var query = new peliasQuery.layout.FilteredBooleanQuery();

// mandatory matches
query.score( peliasQuery.view.boundary_country, 'must' );

// scoring boost
query.sort( peliasQuery.view.sort_distance );

// non-scoring hard filters
query.filter( peliasQuery.view.boundary_circle );
query.filter( peliasQuery.view.sources );
query.filter( peliasQuery.view.layers );
query.filter( peliasQuery.view.categories );

// --------------------------------

function generateQuery( clean ){

  const vs = new peliasQuery.Vars( defaults );

  let logStr = '[query:reverse] ';

  // set size
  if( clean.querySize ){
    vs.var( 'size', clean.querySize);
    logStr += '[param:querySize] ';
  }

  // sources
  if( check.array(clean.sources) && clean.sources.length ) {
    vs.var('sources', clean.sources);
    logStr += '[param:sources] ';
  }

  // layers
  if( check.array(clean.layers) && clean.layers.length ) {
    vs.var( 'layers', clean.layers);
    logStr += '[param:layers] ';
  }

  // focus point to score by distance
  if( check.number(clean['point.lat']) &&
      check.number(clean['point.lon']) ){
    vs.set({
      'focus:point:lat': clean['point.lat'],
      'focus:point:lon': clean['point.lon']
    });
    logStr += '[param:focus_point] ';
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
    logStr += '[param:boundary_circle] ';
  }

  // boundary country
  if( check.string(clean['boundary.country']) ){
    vs.set({
      'boundary:country': clean['boundary.country']
    });
    logStr += '[param:boundary_country] ';
  }

  // categories
  if (clean.categories) {
    vs.var('input:categories', clean.categories);
    logStr += '[param:categories] ';
  }

  logger.info(logStr);

  return {
    type: 'reverse',
    body: query.render(vs)
  };
}

module.exports = generateQuery;
