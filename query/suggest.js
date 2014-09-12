
var logger = require('../src/logger');

// Build pelias suggest query
function generate( params ){
  
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

            // // commented out until they fix the precision bug in ES 1.3.3
            'precision': 2 // params.zoom > 9 ? 3 : (params.zoom > 7 ? 2 : 1)
          }
        }
      }
    }
  };

  logger.log( 'cmd', JSON.stringify( cmd, null, 2 ) );
  return cmd;

}

module.exports = generate;