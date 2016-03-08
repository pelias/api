
var generator = require('../../../helper/labelGenerator');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('interface', function(t) {
    t.equal(typeof generator, 'function', 'valid function');
    t.end();
  });
};

// SWE city
module.exports.tests.skane1 = function(test, common) {
  test('skåne 1', function(t) {
    var doc = {
      'name': 'Malmö',
      'country_a': 'SWE',
      'country': 'Sweden',
      'region': 'Skåne',
      'county': 'Malmö'
    };
    t.equal(generator(doc),'Malmö, Skåne, Sweden');
    t.end();
  });
};

// SWE city
module.exports.tests.skane2 = function(test, common) {
  test('skåne 2', function(t) {
    var doc = {
      'name': 'Malmö',
      'country_a': 'SWE',
      'country': 'Sweden',
      'region': 'Skåne',
      'county': 'Malmö',
      'locality': 'Malmö'
    };
    t.equal(generator(doc),'Malmö, Skåne, Sweden');
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
