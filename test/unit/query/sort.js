
var generate = require('../../../query/sort');

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
  }
];

module.exports.tests.query = function(test, common) {
  test('valid part of query', function(t) {
    t.deepEqual(generate(), expected, 'valid sort part of the query');
    t.deepEqual(generate( {} ), expected, 'valid sort part of the query');
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
