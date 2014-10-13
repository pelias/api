
var logger = require('../src/logger'),
    queries = require('geopipes-elasticsearch-backend').queries;

function generate( params ){

  var centroid = {
    lat: params.lat,
    lon: params.lon
  };

  return queries.distance( centroid, { size: params.size || 1 } );
}

module.exports = generate;