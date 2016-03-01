
var generator = require('../../../helper/labelGenerator');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('interface', function(t) {
    t.equal(typeof generator, 'function', 'valid function');
    t.end();
  });
};

// SGP region
module.exports.tests.north_west_singapore = function(test, common) {
  test('north west singapore', function(t) {
    var doc = {
      'name': { 'default': 'North West' },
      'country_a': 'SGP',
      'country': 'Singapore',
      'region': 'North West'
    };
    t.equal(generator(doc),'North West, Singapore');
    t.end();
  });
};

// SGP venue
module.exports.tests.singapore_mcdonalds = function(test, common) {
  test('singapore_mcdonalds', function(t) {
    var doc = {
      'name': { 'default': 'McDonald\'s' },
      'country_a': 'SGP',
      'country': 'Singapore',
      'region': 'Central Singapore',
      'locality': 'Singapore'
    };
    t.equal(generator(doc),'McDonald\'s, Central Singapore, Singapore');
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('label generator: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
