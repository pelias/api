var admin_boost = 'admin_boost';
var population = 'population';
var popularity = 'popularity';
var category = 'category';
var category_weights = require('../helper/category_weights');
var weights = require('pelias-suggester-pipeline').weights;

module.exports = [
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
        'category_weights': category_weights
      },
      'file': category,
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