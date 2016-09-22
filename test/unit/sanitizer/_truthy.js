var isTruthy = require('../../../sanitizer/_truthy');

module.exports.tests = {};

module.exports.tests.sanitize_truthy = function(test, common) {
  var valid_values = ['true', true, 1, '1', 'yes', 'y'];
  valid_values.forEach(function(value) {
    test('truthy value ' + value, function(t) {
      t.equal(isTruthy(value), true, 'returns true');
      t.end();
    });
  });

  var valid_false_values = ['false', false, 0, '0', 'no', 'n', null, -1, 123, NaN, 'abc'];
  valid_false_values.forEach(function(value) {
    test('falsey value ' + value, function(t) {
      t.equal(isTruthy(value), false, 'returns false');
      t.end();
    });
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('SANTIZE _truthy ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
