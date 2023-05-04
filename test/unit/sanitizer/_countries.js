const countries = require('../../../sanitizer/_countries');
const sanitizer = countries();

module.exports.tests = {};

module.exports.tests.sanitize_boundary_country = function(test, common) {
  test('raw w/o boundary should set boundary.country undefined', function(t) {
    var raw = { };
    var clean = {};
    var errorsAndWarnings = sanitizer.sanitize(raw, clean);
    t.equals(clean['boundary.country'], undefined, 'should be undefined');
    t.deepEquals(errorsAndWarnings, { errors: [], warnings: [] }, 'no warnings or errors');
    t.end();
  });

  test('boundary.country explicitly undefined in raw should leave boundary.country undefined', function(t) {
    var raw = { 'boundary.country': undefined };
    var clean = {};
    var errorsAndWarnings = sanitizer.sanitize(raw, clean);
    t.equals(clean['boundary.country'], undefined, 'should be undefined');
    t.deepEquals(errorsAndWarnings, { errors: [], warnings: [] }, 'no warnings or errors');
    t.end();
  });

  test('non-string boundary.country should set boundary.country to undefined and return warning', function(t) {
    var raw = { 'boundary.country': ['this isn\'t a string primitive'] };
    var clean = {};
    var errorsAndWarnings = sanitizer.sanitize(raw, clean);
    t.equals(clean['boundary.country'], undefined, 'should be undefined');
    t.deepEquals(errorsAndWarnings, { errors: ['boundary.country is not a string'], warnings: [] }, 'non-string country warning');
    t.end();
  });

  test('iso2 boundary.country in raw should set boundary.country to ISO3 uppercased', function(t) {
    var raw = { 'boundary.country': 'aq' };
    var clean = {};
    var errorsAndWarnings = sanitizer.sanitize(raw, clean);
    t.deepEquals(clean['boundary.country'], ['ATA'], 'should be uppercased ISO3');
    t.deepEquals(errorsAndWarnings, { errors: [], warnings: [] }, 'no warnings or errors');
    t.end();
  });

  test('iso3 boundary.country in raw should set boundary.country to matching ISO3 uppercased', function(t) {
    var raw = { 'boundary.country': 'aTa' };
    var clean = {};
    var errorsAndWarnings = sanitizer.sanitize(raw, clean);
    t.deepEquals(clean['boundary.country'], ['ATA'], 'should be uppercased ISO3');
    t.deepEquals(errorsAndWarnings, { errors: [], warnings: [] }, 'no warnings or errors');
    t.end();
  });

  test('unknown 2-character boundary.country should set boundary.country to undefined', function(t) {
    var raw = { 'boundary.country': 'zq' };
    var clean = {};
    var errorsAndWarnings = sanitizer.sanitize(raw, clean);
    t.equals(clean['boundary.country'], undefined, 'should be undefined');
    t.deepEquals(errorsAndWarnings, { errors: ['zq is not a valid ISO2/ISO3 country code'], warnings: [] }, 'country not found warning`');
    t.end();
  });

  test('unknown 3-character boundary.country should set boundary.country to undefined', function(t) {
    var raw = { 'boundary.country': 'zqx' };
    var clean = {};
    var errorsAndWarnings = sanitizer.sanitize(raw, clean);
    t.equals(clean['boundary.country'], undefined, 'should be undefined');
    t.deepEquals(errorsAndWarnings, { errors: ['zqx is not a valid ISO2/ISO3 country code'], warnings: [] }, 'country not found warning`');
    t.end();
  });

  test('return an array of expected parameters in object form for validation', (t) => {
    const expected = [{ name: 'boundary.country' }];
    const validParameters = sanitizer.expected();
    t.deepEquals(validParameters, expected);
    t.end();
  });

  test('return an array of expected custom parameters in object form for validation', (t) => {
    const expected = [{ name: 'custom-name.country' }];
    const validParameters = countries('custom-name').expected();
    t.deepEquals(validParameters, expected);
    t.end();
  });

};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('SANITIZE _boundary_country ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
