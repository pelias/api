const _ = require('lodash');
const peliasQuery = require('pelias-query');
const defaults = require('./reverse_defaults');

//------------------------------
// reverse geocode query
//------------------------------
var query = new peliasQuery.layout.FilteredBooleanQuery();

// mandatory matches
// (none)

// scoring boost
query.sort( peliasQuery.view.sort_distance );

// non-scoring hard filters
query.filter( peliasQuery.view.boundary_circle );
query.filter( peliasQuery.view.sources );
query.filter( peliasQuery.view.layers );
query.filter( peliasQuery.view.categories );
query.filter( peliasQuery.view.boundary_country );
query.filter( peliasQuery.view.boundary_gid );

// --------------------------------

function generateQuery( clean ){

  const vs = new peliasQuery.Vars( defaults );

  // set size
  if( clean.querySize ){
    vs.var( 'size', clean.querySize);
  }

  // sources
  if( _.isArray(clean.sources) && !_.isEmpty(clean.sources) ) {
    vs.var('sources', clean.sources);
  }

  // layers
  if( _.isArray(clean.layers) && !_.isEmpty(clean.layers) ) {
    // only include non-coarse layers
    vs.var( 'layers', _.intersection(clean.layers, ['address', 'street', 'venue']));
  }

  // focus point to score by distance
  if( _.isFinite(clean['point.lat']) &&
      _.isFinite(clean['point.lon']) ){
    vs.set({
      'focus:point:lat': clean['point.lat'],
      'focus:point:lon': clean['point.lon']
    });
  }

  // bounding circle
  // note: the sanitizers will take care of the case
  // where point.lan/point.lon are provided in the
  // absense of boundary.circle.lat/boundary.circle.lon
  if( _.isFinite(clean['boundary.circle.lat']) &&
      _.isFinite(clean['boundary.circle.lon']) ){

        vs.set({
          'boundary:circle:lat': clean['boundary.circle.lat'],
          'boundary:circle:lon': clean['boundary.circle.lon']
        });

        if (_.isUndefined(clean['boundary.circle.radius'])){
          // for coarse reverse when boundary circle radius is undefined
          vs.set({
            'boundary:circle:radius': defaults['boundary:circle:radius']
          });
        } else if (_.isFinite(clean['boundary.circle.radius'])){
          // plain reverse where boundary circle is a valid number
          vs.set({
            'boundary:circle:radius': clean['boundary.circle.radius'] + 'km'
          });
        }
  }

  // boundary country
  if( _.isArray(clean['boundary.country']) && !_.isEmpty(clean['boundary.country']) ){
    vs.set({
      'boundary:country': clean['boundary.country'].join(' ')
    });
  }

  // boundary gid
  if ( _.isString(clean['boundary.gid']) ){
    vs.set({
      'boundary:gid': clean['boundary.gid']
    });
  }

  // categories
  if (clean.categories) {
    vs.var('input:categories', clean.categories);
  }

  return {
    type: 'reverse',
    body: query.render(vs)
  };
}

module.exports = generateQuery;
