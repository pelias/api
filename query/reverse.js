'use strict';

const peliasQuery = require('pelias-query');
const defaults = require('./reverse_defaults');
const check = require('check-types');
const _ = require('lodash');
const logger = require('pelias-logger').get('api');

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
    // only include non-coarse layers
    vs.var( 'layers', _.intersection(clean.layers, ['address', 'street', 'venue']));
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
      check.number(clean['boundary.circle.lon']) ){

        vs.set({
          'boundary:circle:lat': clean['boundary.circle.lat'],
          'boundary:circle:lon': clean['boundary.circle.lon']
        });

        if (check.undefined(clean['boundary.circle.radius'])){
          // for coarse reverse when boundary circle radius is undefined
          vs.set({
            'boundary:circle:radius': defaults['boundary:circle:radius']
          });
        } else if (check.number(clean['boundary.circle.radius'])){
          // plain reverse where boundary circle is a valid number
          vs.set({
            'boundary:circle:radius': clean['boundary.circle.radius'] + 'km'
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
