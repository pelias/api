var sanitize = require('../../../sanitiser/_geo_reverse');

module.exports.tests = {};

module.exports.tests.sanitize_boundary_country = function(test, common) {
  test('raw with boundary.circle.lat should add warning about ignored boundary.circle', function(t) {
    var raw = {
      'point.lat': '12.121212',
      'point.lon': '21.212121',
      'boundary.circle.lat': '13.131313'
    };
    var clean = {};
    var errorsAndWarnings = sanitize(raw, clean);

    t.equals(clean['boundary.circle.lat'], 12.121212, 'should be set to point.lat');
    t.deepEquals(errorsAndWarnings, {
      errors: [],
      warnings: ['boundary.circle is currently unsupported and being ignored']
    }, 'no warnings/errors');
    t.end();
  });

  test('raw with boundary.circle.lon should add warning about ignored boundary.circle', function(t) {
    var raw = {
      'point.lat': '12.121212',
      'point.lon': '21.212121',
      'boundary.circle.lon': '31.313131'
    };
    var clean = {};
    var errorsAndWarnings = sanitize(raw, clean);

    t.equals(clean['boundary.circle.lon'], 21.212121, 'should be set to point.lon');
    t.deepEquals(errorsAndWarnings, {
      errors: [],
      warnings: ['boundary.circle is currently unsupported and being ignored']
    }, 'no warnings/errors');
    t.end();
  });

  test('raw with boundary.circle.radius should add warning about ignored boundary.circle', function(t) {
    var raw = {
      'point.lat': '12.121212',
      'point.lon': '21.212121',
      'boundary.circle.radius': '17'
    };
    var clean = {};
    var errorsAndWarnings = sanitize(raw, clean);

    // t.equals(clean['boundary.circle.radius'], 12.121212, 'should be set to point.lat')
    t.deepEquals(errorsAndWarnings, {
      errors: [],
      warnings: ['boundary.circle is currently unsupported and being ignored']
    }, 'no warnings/errors');
    t.end();
  });

};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('SANTIZE _geo_reverse ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
