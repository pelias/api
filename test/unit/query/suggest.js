
var query = require('../../../query/suggest');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof query, 'function', 'valid function');
    t.end();
  });
};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof query, 'function', 'valid function');
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('suggest query ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};