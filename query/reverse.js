
var logger = require('../src/logger'),
    queries = require('geopipes-elasticsearch-backend').queries,
    sort = require('../query/sort');

function generate( params ){

  var centroid = {
    lat: params.lat,
    lon: params.lon
  };

  var query  =  queries.distance( centroid, { size: params.size || 1 } );
  query.sort = query.sort.concat( sort( params ) );

  return query;
}

module.exports = generate;
