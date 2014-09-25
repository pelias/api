
var logger = require('../src/logger'),
    queries = require('geopipes-elasticsearch-backend').queries;

function generate( params ){

  var centroid = {
    lat: params.lat,
    lon: params.lon
  };

  var query = queries.distance( centroid, { size: params.size } );

  // add search condition to distance query
  query.query.filtered.query = {
    query_string : {
      query: params.input,
      fields: ['name.default'],
      default_operator: 'OR'
    }
  };

  return query;
}

module.exports = generate;