
var queries = require('geopipes-elasticsearch-backend').queries,
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

  // add search condition to filtered query
  query.query.filtered.query = {
    'bool': {
      'must': [{ 
        'multi_match': {
          'query': params.input,
          'fields': [ 'name.*' ]
        }
      }]
    }
  };

  // should query contitions
  query.query.filtered.query.bool.should = [];

  // add shingles should query
  // note: this is required for partial phrase matching
  query.query.filtered.query.bool.should.push({
    'multi_match': {
      'query': params.input,
      'fields': [ 'shingle.*' ]
    }
  });

  if (params.input_admin) {
    var admin_fields = ['admin0', 'admin1', 'admin1_abbr', 'admin2', 'alpha3'];

    admin_fields.forEach(function(admin_field) {
      var match = {};
      match[admin_field] = params.input_admin;
      query.query.filtered.query.bool.should.push({
        'match': match
      });
    });
  }

  query.sort = query.sort.concat( sort( params ) );

  return query;
}

module.exports = generate;
