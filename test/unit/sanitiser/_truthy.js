var truthy = require('../../../sanitiser/_truthy');

module.exports.tests = {};

module.exports.tests.sanitize_truthy = function(test, common) {
  var valid_values = ['true', true, 1, '1', 'yes', 'y'];
  valid_values.forEach(function(value) {
    test('truthy value ' + value, function(t) {
      t.equal(truthy.isTruthy(value), true, 'returns true');
      t.end();
    });
  });

  var valid_false_values = ['false', false, 0, '0', 'no', 'n', null, -1, 123, NaN, 'abc'];
  valid_false_values.forEach(function(value) {
    test('falsey value ' + value, function(t) {
      t.equal(truthy.isTruthy(value), false, 'returns false');
      t.end();
    });
  });
};

module.exports.tests.sanitize_truthy_with_default = function(test, common) {
  test('explicit undefined default_value parameter should throw an exception', function(t) {
    try {
      truthy.isTruthyWithDefault(true, undefined);
      t.fail('an exception should have been thrown');
    }
    catch (e) {
      t.equal(e.message, 'default_value cannot be undefined', 'should throw an exception');
    }
    finally {
      t.end();
    }
  });

  test('implicit undefined default_value parameter should throw an exception', function(t) {
    try {
      truthy.isTruthyWithDefault(true);
      t.fail('an exception should have been thrown');
    }
    catch (e) {
      t.equal(e.message, 'default_value cannot be undefined', 'should throw an exception');
    }
    finally {
      t.end();
    }
  });

  test('undefined value with falsey default value should return false', function(t) {
    t.equal(truthy.isTruthyWithDefault(undefined, 0), false, 'should return false');
    t.end();
  });

  test('undefined value with truthy default value should return true', function(t) {
    t.equal(truthy.isTruthyWithDefault(undefined, 1), true, 'should return true');
    t.end();
  });

  test('undefined value should return true when defaultValue is true', function(t) {
    t.equal(truthy.isTruthyWithDefault(undefined, true), true, 'should return true');
    t.end();
  });

  test('undefined value should return false when defaultValue is false', function(t) {
    t.equal(truthy.isTruthyWithDefault(undefined, false), false, 'should return false');
    t.end();
  });

  test('true value should return true when defaultValue is false', function(t) {
    t.equal(truthy.isTruthyWithDefault(true, false), true, 'should return true');
    t.end();
  });

  test('false value should return false when defaultValue is true', function(t) {
    t.equal(truthy.isTruthyWithDefault(false, true), false, 'should return false');
    t.end();
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
