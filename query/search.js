
var logger = require('../src/logger'),
    queries = require('geopipes-elasticsearch-backend').queries,
    sort = require('../query/sort');

function generate( params ){

  var centroid = null;

  if ( params.lat && params.lon ){
    centroid = {
      lat: params.lat,
      lon: params.lon
    };
  } 
  
  var query = queries.distance( centroid, { size: params.size } );
  
  if (params.bbox) {
    query = queries.bbox ( centroid, { size: params.size, bbox: params.bbox } );
  }

  // add search condition to distance query
  query.query.filtered.query = {
    query_string : {
      query: params.input,
      fields: ['name.default'],
      default_operator: 'OR'
    }
  };

  query.sort = query.sort.concat(sort);

  return query;
}

module.exports = generate;