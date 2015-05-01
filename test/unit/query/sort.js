
var generate = require('../../../query/sort');
var admin_boost = 'admin_boost';
var population = 'population';
var popularity = 'popularity';
var category = 'category';
var category_weights = require('../../../helper/category_weights');
var weights = require('pelias-suggester-pipeline').weights;

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof generate(), 'object', 'valid object');
    t.equal(typeof generate({input: 'foobar'}), 'object', 'valid object');
    t.end();
  });
};

var expected = [
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

module.exports.tests.query = function(test, common) {
  test('valid part of query', function(t) {
    t.deepEqual(generate(), expected, 'valid sort part of the query');
    t.deepEqual(generate( {} ), expected, 'valid sort part of the query');
    t.end();
  });
};

module.exports.tests.queryWithInput = function ( test, common ){
  test( 'Valid sort query component when input is present.', function ( t ){
    var expectedWithInput = expected.slice();
    expectedWithInput.push({
      _script: {
        params: {
          input: 'foobar'
        },
        file: 'exact_match',
        type: 'number',
        order: 'desc'
      }
    });
    t.deepEqual(generate({ input: 'foobar' }), expectedWithInput, 'valid sort part of the query');
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('sort query ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
