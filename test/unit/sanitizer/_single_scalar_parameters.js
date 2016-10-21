var sanitize = require('../../../sanitizer/_single_scalar_parameters');

module.exports.tests = {};

module.exports.tests.single_scalar_parameters = function(test, common) {
  test('all duplicate parameters should have error messages returned', function(t) {
    var raw = {
      arrayParameter1: ['value1', 'value2'],
      scalarParameter: 'value',
      arrayParameter2: ['value3']
    };
    var clean = {};
    var errorsAndWarnings = sanitize(raw, clean);
    t.deepEquals(errorsAndWarnings, {
      errors: [
        '\'arrayParameter1\' parameter can only have one value',
        '\'arrayParameter2\' parameter can only have one value',
      ],
      warnings: []
    });
    t.end();
  });

  test('object parameters should have error messages returned', function(t) {
    var raw = {
      objectParameter1: { key1: 'value1', key2: 'value2'},
      scalarParameter: 'value',
      objectParameter2: { }
    };
    var clean = {};
    var errorsAndWarnings = sanitize(raw, clean);
    t.deepEquals(errorsAndWarnings, {
      errors: [
        '\'objectParameter1\' parameter must be a scalar',
        '\'objectParameter2\' parameter must be a scalar'
      ],
      warnings: []
    });
    t.end();
  });

  test('request with all scalar parameters should return empty errors', function(t) {
    var raw = { scalarParameter1: 'value1', scalarParameter2: 2, scalarParameter3: true };
    var clean = {};
    var errorsAndWarnings = sanitize(raw, clean);
    t.deepEquals(errorsAndWarnings, { errors: [], warnings: [] });
    t.end();
  });

};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('SANTIZE _single_scalar_parameters ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
