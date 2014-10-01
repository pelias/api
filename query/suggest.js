
var logger = require('../src/logger');

// Build pelias suggest query
function generate( params ){

  var getPrecision = function(zoom) {
    switch (true) {
      case (zoom < 5):
        return 1; // zoom: 1-3
      case (zoom < 6):
        return 2; // zoom: 4-5
      case (zoom < 10):
        return 3; // zoom: 6-9
      case (zoom < 16):
        return 4; // zoom: 10-15
      default:
        return 5; // zoom: >= 16
    }
  };

  var cmd = {
    'pelias' : {
      'text' : params.input,
      'completion' : {
        'size' : params.size,
        'field' : 'suggest',
        'context': {
          'dataset': params.layers,
          'location': {
            'value': [ params.lon, params.lat ],
            'precision': getPrecision(params.zoom)
          }
        }
      }
    }
  };

  // logger.log( 'cmd', JSON.stringify( cmd, null, 2 ) );
  return cmd;

}

module.exports = generate;