
var category_weights = require('../../../helper/category_weights');
var admin_weights = require('../../../helper/admin_weights');
var weights = require('pelias-suggester-pipeline').weights;

module.exports = [
  '_score',
  {
    '_script': {
      'file': 'admin_boost',
      'type': 'number',
      'order': 'desc'
    }
  },
  {
    '_script': {
      'file': 'popularity',
      'type': 'number',
      'order': 'desc'
    }
  },
  {
    '_script': {
      'file': 'population',
      'type': 'number',
      'order': 'desc'
    }
  },
  {
    '_script': {
      'params': {
        'weights': admin_weights
      },
      'file': 'weights',
      'type': 'number',
      'order': 'desc'
    }
  },
  {
    '_script': {
      'params': {
        'category_weights': category_weights.default
      },
      'file': 'category',
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