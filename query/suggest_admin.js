
var logger = require('../src/logger');

// Build pelias suggest query
function generate( params, precision ){

  var cmd = {
    'pelias' : {
      'text' : params.input,
      'completion' : {
        'size' : params.size,
        'field' : 'suggest',
        'context': {
          'dataset': ['admin0','admin1','admin2'],
          'location': {
            'value': [ params.lon, params.lat ],
            'precision': precision || 1
          }
        }
      }
    }
  };

  // logger.log( 'cmd', JSON.stringify( cmd, null, 2 ) );
  return cmd;

}

module.exports = generate;