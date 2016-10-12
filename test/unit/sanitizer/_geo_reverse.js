var sanitize = require('../../../sanitizer/_geo_reverse');
var defaults = require('../../../query/reverse_defaults');

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
      warnings: ['boundary.circle.lat/boundary.circle.lon are currently unsupported']
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
      warnings: ['boundary.circle.lat/boundary.circle.lon are currently unsupported']
    }, 'no warnings/errors');
    t.end();
  });

  test('raw with boundary.circle.radius shouldn\'t add warning about ignored boundary.circle', function(t) {
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
      warnings: []
    }, 'no warnings/errors');
    t.end();
  });

  test('boundary.circle.lat/lon should be overridden with point.lat/lon', function(t) {
    var raw = {
      'point.lat': '12.121212',
      'point.lon': '21.212121',
      'boundary.circle.lat': '13.131313',
      'boundary.circle.lon': '31.313131'
    };
    var clean = {};
    var errorsAndWarnings = sanitize(raw, clean);

    t.equals(raw['boundary.circle.lat'], 12.121212, 'should be set to point.lat');
    t.equals(raw['boundary.circle.lon'], 21.212121, 'should be set to point.lon');
    t.equals(clean['boundary.circle.lat'], 12.121212, 'should be set to point.lat');
    t.equals(clean['boundary.circle.lon'], 21.212121, 'should be set to point.lon');
    t.end();
  });

  test('no boundary.circle.radius and no layers supplied should be set to default', function(t) {
    var raw = {
      'point.lat': '12.121212',
      'point.lon': '21.212121'
    };
    var clean = {};
    var errorsAndWarnings = sanitize(raw, clean);

    t.equals(raw['boundary.circle.radius'], defaults['boundary:circle:radius'], 'should be from defaults');
    t.equals(clean['boundary.circle.radius'], parseFloat(defaults['boundary:circle:radius']), 'should be same as raw');
    t.end();
  });

  test('no boundary.circle.radius and coarse layers supplied should be set to coarse default', function(t) {
    var raw = {
      'point.lat': '12.121212',
      'point.lon': '21.212121'
    };
    var clean = { layers: 'coarse' };
    var errorsAndWarnings = sanitize(raw, clean);

    t.equals(raw['boundary.circle.radius'], defaults['boundary:circle:radius:coarse'], 'should be from defaults');
    t.equals(clean['boundary.circle.radius'], parseFloat(defaults['boundary:circle:radius:coarse']), 'should be same as raw');
    t.end();
  });

  test('no boundary.circle.radius and coarse layer supplied should be set to coarse default', function(t) {
    var raw = {
      'point.lat': '12.121212',
      'point.lon': '21.212121'
    };
    var clean = { layers: 'locality' };
    var errorsAndWarnings = sanitize(raw, clean);

    t.equals(raw['boundary.circle.radius'], defaults['boundary:circle:radius:coarse'], 'should be from defaults');
    t.equals(clean['boundary.circle.radius'], parseFloat(defaults['boundary:circle:radius:coarse']), 'should be same as raw');
    t.end();
  });

  test('explicit boundary.circle.radius should be used instead of default', function(t) {
    var raw = {
      'point.lat': '12.121212',
      'point.lon': '21.212121',
      'boundary.circle.radius': '3248732857km' // this will never be the default
    };
    var clean = {};
    var errorsAndWarnings = sanitize(raw, clean);

    t.equals(raw['boundary.circle.radius'], '3248732857km', 'should be parsed float');
    t.equals(clean['boundary.circle.radius'], 3248732857.0, 'should be copied from raw');
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
