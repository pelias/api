
var logger = require('../src/logger');

// Build pelias suggest query
function generate( params ){

  var getPrecision = function(zoom) {
    switch (true) {
      case (zoom > 15):
        return 5; // zoom: >= 16
      case (zoom > 9):
        return 4; // zoom: 10-15
      case (zoom > 5):
        return 3; // zoom: 6-9
      case (zoom > 3):
        return 2; // zoom: 4-5
      default:
        return 1; // zoom: 1-3 or when zoom: undefined
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