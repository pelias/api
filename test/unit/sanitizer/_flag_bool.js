var sanitizer = require('../../../sanitizer/_flag_bool');

module.exports.tests = {};

module.exports.tests.sanitize_private = function(test, common) {
  var invalid_values = [null, -1, 123, NaN, 'abc'];
  invalid_values.forEach(function (value) {
    test('invalid dirty_param ' + value, function (t) {
      var raw = {dirty_param: value};
      var clean = {};
      sanitizer('dirty_param', true).sanitize(raw, clean);
      t.equal(clean.dirty_param, false, 'default clean value set (to false)');
      t.end();
    });
  });

  var valid_values = ['true', true, 1, '1'];
  valid_values.forEach(function (value) {
    test('valid dirty_param ' + value, function (t) {
      var raw = {dirty_param: value};
      var clean = {};
      sanitizer('dirty_param', true).sanitize(raw, clean);
      t.equal(clean.dirty_param, true, 'clean value set to true');
      t.end();
    });
  });

  var valid_false_values = ['false', false, 0, '0'];
  valid_false_values.forEach(function (value) {
    test('test setting false explicitly ' + value, function (t) {
      var raw = {dirty_param: value};
      var clean = {};
      sanitizer('dirty_param', true).sanitize(raw, clean);
      t.equal(clean.dirty_param, false, 'clean value set to false');
      t.end();
    });
  });
};

module.exports.tests.validate_default_behavior = function(test, common) {
  var default_values = [true, false, 'foo'];
  default_values.forEach(function (defaultValue) {
    test('test default behavior: ' + defaultValue, function (t) {
      var sanitize_true = sanitizer('foo_bar', defaultValue);
      var raw = {};
      var clean = {};
      sanitize_true.sanitize(raw, clean);
      t.equal(clean.foo_bar, defaultValue, 'foo_bar set to ' + defaultValue);
      t.end();
    });
  });
};

module.exports.tests.check_valid_parameters = function(test, common) {
  test('return an array of expected parameters in object form for validation', (t) => {
    const expected = [{ name: 'value' }]; // depends on first argument of sanitizer()
    const validParameters = sanitizer('value', true).expected();
    t.deepEquals(validParameters, expected);
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('SANITIZE _flag_bool: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
