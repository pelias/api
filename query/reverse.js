var peliasQuery = require('pelias-query'),
    defaults = require('./defaults'),
    check = require('check-types');

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
  if (clean.hasOwnProperty('boundary.circle.radius')) {
    radius = clean['boundary.circle.radius'];
  }

  // focus point centroid
  if( check.number(clean['point.lat']) && check.number(clean['point.lon']) ){
    vs.set({
      // focus point to score by distance
      'focus:point:lat': clean['point.lat'],
      'focus:point:lon': clean['point.lon'],

      // bounding circle
      'boundary:circle:lat': clean['point.lat'],
      'boundary:circle:lon': clean['point.lon'],
      'boundary:circle:radius': radius + 'km'
    });
  }

  // boundary country
  if( clean.boundary && clean.boundary.country ){
    vs.set({
      'boundary:country': clean.boundary.country
    });
  }

  return query.render( vs );
}

module.exports = generateQuery;
