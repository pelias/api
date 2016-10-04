var peliasQuery = require('pelias-query'),
    defaults = require('./reverse_defaults'),
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
query.filter( peliasQuery.view.sources );
query.filter( peliasQuery.view.layers );
query.filter( peliasQuery.view.categories );

// --------------------------------

function generateQuery( clean ){

  var vs = new peliasQuery.Vars( defaults );

  // set size
  if( clean.querySize ){
    vs.var( 'size', clean.querySize);
  }

  // sources
  vs.var( 'sources', clean.sources);

  // layers
  vs.var( 'layers', clean.layers);

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
