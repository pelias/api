
var peliasQuery = require('pelias-query'),
    defaults = require('./defaults');

//------------------------------
// reverse geocode query
//------------------------------
var query = new peliasQuery.layout.FilteredBooleanQuery();

// scoring boost
query.sort( peliasQuery.view.sort_distance );

// non-scoring hard filters
query.filter( peliasQuery.view.boundary_circle );

// --------------------------------

function generateQuery( clean ){

  var vs = new peliasQuery.Vars( defaults );

  // set defaults
  vs.set({
    'size': 1
  });

  // set size
  if( clean.size ){
    vs.var( 'size', clean.size );
  }

  // set radius, default to 500km if not specified in request
  var radius = 500;
  if (clean.hasOwnProperty('boundary_circle_radius')) {
    radius = clean.boundary_circle_radius;
  }

  // focus point centroid
  if( clean.lat && clean.lon ){
    vs.set({
      // focus point to score by distance
      'focus:point:lat': clean.lat,
      'focus:point:lon': clean.lon,

      // bounding circle
      'boundary:circle:lat': clean.lat,
      'boundary:circle:lon': clean.lon,
      'boundary:circle:radius': radius + 'km'
    });
  }

  return query.render( vs );
}

module.exports = generateQuery;
