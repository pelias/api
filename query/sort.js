var admin_boost = 'admin_boost';
var population = 'population';
var popularity = 'popularity';
var weights = require('pelias-suggester-pipeline').weights;

module.exports = function( params ){
  var scriptsConfig = [
    {
      '_script': {
        'file': admin_boost,
        'type': 'number',
        'order': 'desc'
      }
    },
    {
      '_script': {
        'file': population,
        'type': 'number',
        'order': 'desc'
      }
    },
    {
      '_script': {
        'file': popularity,
        'type': 'number',
        'order': 'desc'
      }
    },
    {
      '_script': {
        'params': {
          'weights': weights
        },
        'file': 'weights',
        'type': 'number',
        'order': 'desc'
      }
    }
  ];

  if( typeof params === 'object' && params.hasOwnProperty( 'input' ) ){
    scriptsConfig.push({
      _script: {
        params: {
          input: params.input
        },
        file: 'exact_match',
        type: 'number',
        order: 'desc'
      }
    });
  }

  return scriptsConfig;
};
