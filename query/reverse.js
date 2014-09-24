var logger = require('../src/logger');

// Build pelias search query
function generate( params ){

  var cmd = {
    'query':{
      'filtered' : {
        'query' : {
          'match_all' : {}
        },
        'filter' : {
          'geo_distance' : {
            'distance' : '1km',
            'center_point' : {
              'lat': params.lat,
              'lon': params.lon
            }
          }
        }
      }
    },
    'size': 1
  };

  // logger.log( 'cmd', JSON.stringify( cmd, null, 2 ) );
  return cmd;

}

module.exports = generate;