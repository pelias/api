var sanitizer = require('../../../sanitizer/_sources_and_layers')();

var type_mapping = require('../../../helper/type_mapping');

module.exports.tests = {};

module.exports.tests.inactive = function(test, common) {
  test('no source or layer specified', function(t) {
    var raw = {};
    var clean = {};

    var messages = sanitizer.sanitize(raw, clean);

    t.equal(messages.errors.length, 0, 'should return no errors');
    t.equal(messages.warnings.length, 0, 'should return no warnings');
    t.end();
  });

  test('only layers specified', function(t) {
    var raw = {};
    var clean = { layers: ['venue'] };

    var messages = sanitizer.sanitize(raw, clean);

    t.equal(messages.errors.length, 0, 'should return no errors');
    t.equal(messages.warnings.length, 0, 'should return no warnings');
    t.end();
  });

  test('only sources specified', function(t) {
    var raw = {};
    var clean = { sources: ['openstreetmap'] };

    var messages = sanitizer.sanitize(raw, clean);

    t.equal(messages.errors.length, 0, 'should return no errors');
    t.equal(messages.warnings.length, 0, 'should return no warnings');
    t.end();
  });
};

module.exports.tests.no_errors = function(test, common) {
  test('valid combination', function(t) {
    var raw = {};
    var clean = { sources: ['openstreetmap'], layers: ['venue'] };

    var messages = sanitizer.sanitize(raw, clean);

    t.equal(messages.errors.length, 0, 'should return no errors');
    t.equal(messages.warnings.length, 0, 'should return no warnings');
    t.end();
  });

test('valid combination', function(t) {
    var raw = {};
    var clean = { sources: ['geonames'], layers: ['borough'] };

    var messages = sanitizer.sanitize(raw, clean);

    t.equal(messages.errors.length, 0, 'should return no errors');
    t.equal(messages.warnings.length, 0, 'should return no warnings');
    t.end();
  });

  test('valid combination', function(t) {
    var raw = {};
    var clean = { sources: ['geonames'], layers: ['macroregion'] };

    var messages = sanitizer.sanitize(raw, clean);

    t.equal(messages.errors.length, 0, 'should return no errors');
    t.equal(messages.warnings.length, 0, 'should return no warnings');
    t.end();
  });

  test('valid combination: wof venues', function(t) {
    var raw = {};
    var clean = { sources: ['whosonfirst'], layers: ['venue'] };

    var messages = sanitizer.sanitize(raw, clean);

    t.equal(messages.errors.length, 0, 'should return no errors');
    t.equal(messages.warnings.length, 0, 'should return no warnings');
    t.end();
  });

  test('valid combination because of multiple sources', function(t) {
    var raw = {};
    var clean = { sources: ['openstreetmap', 'openaddresses'], layers: ['venue'] };

    var messages = sanitizer.sanitize(raw, clean);

    t.equal(messages.errors.length, 0, 'should return no errors');
    t.equal(messages.warnings.length, 0, 'should return no warnings');
    t.end();
  });

  test('valid combination because of multiple layers', function(t) {
    var raw = {};
    var clean = { sources: ['openaddresses'], layers: ['address', 'country'] };

    var messages = sanitizer.sanitize(raw, clean);

    t.equal(messages.errors.length, 0, 'should return no errors');
    t.equal(messages.warnings.length, 0, 'should return no warnings');
    t.end();
  });

  test('return an array of expected parameters in object form for validation', function (t) {
    const expected = [{ 'name': 'sources' }, { 'name': 'layers' }];
    const validParameters = sanitizer.expected();
    t.deepEquals(validParameters, expected);
    t.end();
  });
};

module.exports.tests.invalid_combination = function(test, common) {
  test('address layer with wof', function(t) {
    var raw = {};
    var clean = { sources: ['whosonfirst'], layers: ['address'] };

    var messages = sanitizer.sanitize(raw, clean);

    t.equal(messages.errors.length, 1, 'should return an error');
    t.equal(messages.errors[0], 'You have specified both the `sources` and `layers` ' +
      'parameters in a combination that will return no results: the whosonfirst source has nothing in the address layer');
    t.equal(messages.warnings.length, 0, 'should return no warnings');
    t.end();
  });

  test('admin layers with osm', function(t) {
    var raw = {};
    var clean = { sources: ['openstreetmap'], layers: ['country', 'locality'] };

    var messages = sanitizer.sanitize(raw, clean);

    t.equal(messages.errors.length, 2, 'should return an error');
    t.equal(messages.errors[0], 'You have specified both the `sources` and `layers` ' +
      'parameters in a combination that will return no results: the openstreetmap source has nothing in the country layer');
    t.equal(messages.errors[1], 'You have specified both the `sources` and `layers` ' +
      'parameters in a combination that will return no results: the openstreetmap source has nothing in the locality layer');
    t.equal(messages.warnings.length, 0, 'should return no warnings');
    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('SANTIZE _sources_and_layers ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
