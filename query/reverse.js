
var queries = require('geopipes-elasticsearch-backend').queries,
    sort = require('./sort');

function generate( params ){

  var centroid = {
    lat: params.lat,
    lon: params.lon
  };

  var query  =  queries.distance( centroid, { size: params.size || 1 } );
  query.sort = query.sort.concat( sort( params ) );

  if ( params.categories && params.categories.length > 0 ) {
    addCategoriesFilter( query, params.categories );
  }

  return query;
}

function addCategoriesFilter( query, categories ) {
  query.query.filtered.filter.bool.must.push({
    terms: { category: categories }
  });
}

module.exports = generate;
