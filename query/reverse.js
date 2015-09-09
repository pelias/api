
var peliasQuery = require('pelias-query'),
    sort = require('./sort');

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

  var vs = new peliasQuery.Vars( peliasQuery.defaults );

  // set defaults
  vs.set({
    'size': 1,
    'boundary:circle:radius': '500km'
  });

  // set size
  if( clean.size ){
    vs.var( 'size', clean.size );
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
    });
  }

  var result = query.render( vs );

  // @todo: remove this hack
  return JSON.parse( JSON.stringify( result ) );
}

module.exports = generateQuery;
