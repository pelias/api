var sanitizer = require('../../../sanitizer/_boundary_wof')();

module.exports.tests = {};

module.exports.tests.sanitize_boundary_wof = function(test, common) {
  test('raw w/o boundary should set boundary.wof undefined', function(t) {
    var raw = { };
    var clean = {};
    var errorsAndWarnings = sanitizer.sanitize(raw, clean);
    t.equals(clean['boundary.wof'], undefined, 'should be undefined');
    t.deepEquals(errorsAndWarnings, { errors: [], warnings: [] }, 'no warnings or errors');
    t.end();
  });

  test('boundary.wof explicitly undefined in raw should leave boundary.wof undefined', function(t) {
    var raw = { 'boundary.wof': undefined };
    var clean = {};
    var errorsAndWarnings = sanitizer.sanitize(raw, clean);
    t.equals(clean['boundary.wof'], undefined, 'should be undefined');
    t.deepEquals(errorsAndWarnings, { errors: [], warnings: [] }, 'no warnings or errors');
    t.end();
  });

  test('non-string boundary.wof should set boundary.wof to undefined and return warning', function(t) {
    var raw = { 'boundary.wof': ['this isn\'t a string primitive'] };
    var clean = {};
    var errorsAndWarnings = sanitizer.sanitize(raw, clean);
    t.equals(clean['boundary.wof'], undefined, 'should be undefined');
    t.deepEquals(errorsAndWarnings, { errors: ['boundary.wof is not a string'], warnings: [] }, 'non-string wof_id warning');
    t.end();
  });

  test('non-int boundary.wof in raw should set boundary.wof to undefined and return warning', function(t) {
    var raw = { 'boundary.wof': 'abcd' };
    var clean = {};
    var errorsAndWarnings = sanitizer.sanitize(raw, clean);
    t.equals(clean['boundary.wof'], undefined, 'should be undefined');
    t.deepEquals(errorsAndWarnings, { errors: ['abcd is not a valid integer'], warnings: [] }, 'non-int wof_id error');
    t.end();
  });

  test('mixed str/int boundary.wof in raw should set boundary.wof to undefined', function(t) {
    var raw = { 'boundary.wof': '123abc' };
    var clean = {};
    var errorsAndWarnings = sanitizer.sanitize(raw, clean);
    t.equals(clean['boundary.wof'], undefined, 'should be undefined');
    t.deepEquals(errorsAndWarnings, { errors: ['123abc is not a valid integer'], warnings: [] }, 'non-int wof_id error');
    t.end();
  });

  test('negative int boundary.wof in raw should set boundary.wof to undefined', function(t) {
    var raw = { 'boundary.wof': '-123' };
    var clean = {};
    var errorsAndWarnings = sanitizer.sanitize(raw, clean);
    t.equals(clean['boundary.wof'], undefined, 'should be undefined');
    t.deepEquals(errorsAndWarnings, { errors: ['-123 is not a valid integer'], warnings: [] }, 'non-int wof_id error');
    t.end();
  });

  test('int boundary.wof in raw should set boundary.wof to int', function(t) {
    var raw = { 'boundary.wof': '123' };
    var clean = {};
    var errorsAndWarnings = sanitizer.sanitize(raw, clean);
    t.equals(clean['boundary.wof'], 123, 'should be undefined');
    t.deepEquals(errorsAndWarnings, { errors: [], warnings: [] }, 'valid wof_id integer is set');
    t.end();
  });

  test('return an array of expected parameters in object form for validation', (t) => {
    const expected = [{ name: 'boundary.wof' }];
    const validParameters = sanitizer.expected();
    t.deepEquals(validParameters, expected);
    t.end();
  });

};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('SANITIZE _boundary_wof ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
