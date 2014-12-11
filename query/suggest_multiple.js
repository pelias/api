
var logger = require('../src/logger');

// Build pelias suggest query
function generate( params, precision ){

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
    'text' : params.input,
    'pelias_1' : {
      'completion' : {
        'size' : params.size,
        'field' : 'suggest',
        'context': {
          'dataset': params.layers,
          'location': {
            'value': [ params.lon, params.lat ],
            'precision': 5
          }
        }
      }
    },
    'pelias_2' : {
      'completion' : {
        'size' : params.size,
        'field' : 'suggest',
        'context': {
          'dataset': params.layers,
          'location': {
            'value': [ params.lon, params.lat ],
            'precision': 3
          }
        }
      }
    },
    'pelias_3' : {
      'completion' : {
        'size' : params.size,
        'field' : 'suggest',
        'context': {
          'dataset': params.layers,
          'location': {
            'value': [ params.lon, params.lat ],
            'precision': 1
          }
        }
      }
    },
    'pelias_4' : {
      'completion' : {
        'size' : params.size,
        'field' : 'suggest',
        'context': {
          'dataset': ['admin0', 'admin1', 'admin2'],
          'location': {
            'value': [ params.lon, params.lat ],
            'precision': precision || getPrecision(params.zoom)
          }
        }
      }
    },
    'pelias_5' : {
      'completion' : {
        'size' : params.size,
        'field' : 'suggest',
        'context': {
          'dataset': params.layers,
          'location': {
            'value': [ params.lon, params.lat ],
            'precision': 3
          }
        },
        'fuzzy': {}
      }
    }
  };

  // logger.log( 'cmd', JSON.stringify( cmd, null, 2 ) );
  return cmd;

}

module.exports = generate;