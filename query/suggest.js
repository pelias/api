
var logger = require('../src/logger');

// Build pelias suggest query
function generate( params ){

  var getPrecision = function(zoom) {
    if (zoom>=15) {
      return 9;
    } else {
      return parseInt(zoom/2) || 1;
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