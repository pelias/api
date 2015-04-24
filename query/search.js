
var logger = require('../src/logger'),
    queries = require('geopipes-elasticsearch-backend').queries,
    get_layers = require('../helper/layers'),
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
    'bool': {
      'must': [{ 
          'match': {
            'name.default': params.input
          }
        }
      ]   
    }
  };
  
  /**
   * If the query contained an administrative region name, boost results that
   * contain a matching admin value, assigning higher values to higher admin
   * levels (admin0 carries more weight than locality, for instance).
   */
  if (params.input_admin) {
    var adminFieldWeights = {
      admin0: 20,
      alpha3: 20,
      admin1: 10,
      admin1_abbr: 10,
      admin2: 5,
      locality: 1,
      local_admin: 1
    };
    query.query.filtered.query.bool.should = Object.keys( adminFieldWeights ).map( function ( field ){
      var boostFactor = adminFieldWeights[ field ];
      var shouldClause = { match: { } };
      shouldClause.match[ field ] = {
        query: params.input_admin,
        boost: boostFactor
      };
      return shouldClause;
    });
  }

  query.sort = query.sort.concat(sort);
  return query;
}

module.exports = generate;
