var logger = require('../src/logger');

// Build pelias search query
function generate( params ){

  var cmd = {
    'query':{
      'query_string' : {
          'query': params.input,
          'fields': ['name.default'],
          'default_operator': 'OR'
        }
      },
      'filter': {
        'geo_bounding_box': {
          'center_point': {
            'bottom_left': {
              'lat': params.bbox.bottom_left.lat,
              'lon': params.bbox.bottom_left.lon
            },
            'top_right': {
              'lat': params.bbox.top_right.lat,
              'lon': params.bbox.top_right.lon
            }
          }
        }
      },
      'sort' : [{
        '_geo_distance' : {
          'center_point' : {
            'lat': params.lat, 
            'lon': params.lon 
          },
          'order': 'asc',
          'unit': 'km'
        }
      }],
      'size': params.size
  };

  // logger.log( 'cmd', JSON.stringify( cmd, null, 2 ) );
  return cmd;

}

module.exports = generate;