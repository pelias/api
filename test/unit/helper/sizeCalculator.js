
var calcSize = require('../../../helper/sizeCalculator.js');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('interface', function(t) {
    t.equal(typeof calcSize, 'function', 'valid function');
    t.end();
  });
};

module.exports.tests.valid = function(test, common) {
  test('size=0', function (t) {
    t.equal(calcSize(0), 1);
    t.end();
  });

  test('size=1', function (t) {
    t.equal(calcSize(1), 1);
    t.end();
  });

  test('size=10', function (t) {
    t.equal(calcSize(10), 20);
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('sizeCalculator: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
