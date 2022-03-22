const sanitizer = require('../../../sanitizer/_geo_reverse')();
const defaults = require('../../../query/reverse_defaults');

module.exports.tests = {};

module.exports.tests.warning_situations = (test, common) => {
  test('raw with boundary.circle.lat should add warning about ignored boundary.circle', (t) => {
    const raw = {
      'point.lat': '12.121212',
      'point.lon': '21.212121',
      'boundary.circle.lat': '13.131313'
    };
    const clean = {};
    const errorsAndWarnings = sanitizer.sanitize(raw, clean);

    t.equals(clean['boundary.circle.lat'], 12.121212, 'should be set to point.lat');
    t.deepEquals(errorsAndWarnings, {
      errors: [],
      warnings: ['boundary.circle.lat/boundary.circle.lon are currently unsupported']
    }, 'no warnings/errors');
    t.end();

  });

  test('raw with boundary.circle.lon should add warning about ignored boundary.circle', (t) => {
    const raw = {
      'point.lat': '12.121212',
      'point.lon': '21.212121',
      'boundary.circle.lon': '31.313131'
    };
    const clean = {};
    const errorsAndWarnings = sanitizer.sanitize(raw, clean);

    t.equals(clean['boundary.circle.lon'], 21.212121, 'should be set to point.lon');
    t.deepEquals(errorsAndWarnings, {
      errors: [],
      warnings: ['boundary.circle.lat/boundary.circle.lon are currently unsupported']
    }, 'no warnings/errors');
    t.end();

  });

  test('raw with boundary.circle.radius shouldn\'t add warning about ignored boundary.circle', (t) => {
    const raw = {
      'point.lat': '12.121212',
      'point.lon': '21.212121',
      'boundary.circle.radius': '17'
    };
    const clean = {};
    const errorsAndWarnings = sanitizer.sanitize(raw, clean);

    // t.equals(clean['boundary.circle.radius'], 12.121212, 'should be set to point.lat')
    t.deepEquals(errorsAndWarnings, {
      errors: [],
      warnings: []
    }, 'no warnings/errors');
    t.end();

  });

};

module.exports.tests.success_conditions = (test, common) => {
  // note: this behaviour is historic and should probably be removed.
  // it's possible to add non-numeric tokens to the boundary.circle.radius
  // value and they are simply stripped out by parseFloat() with warning.
  test('boundary.circle.radius must be a positive number', (t) => {
    const raw = {
      'point.lat': '12.121212',
      'point.lon': '21.212121',
      'boundary.circle.radius': '1km' // note the 'km'
    };
    const clean = {};
    const errorsAndWarnings = sanitizer.sanitize(raw, clean);

    t.equals(clean['boundary.circle.lat'], 12.121212);
    t.equals(clean['boundary.circle.lon'], 21.212121);
    t.equals(clean['boundary.circle.radius'], 1.0);

    t.deepEquals(errorsAndWarnings, { errors: [], warnings: [] });
    t.end();
  });

  test('boundary.circle.radius specified in request should override default', (t) => {
    const raw = {
      'point.lat': '12.121212',
      'point.lon': '21.212121',
      'boundary.circle.radius': '2'
    };
    const clean = {};
    const errorsAndWarnings = sanitizer.sanitize(raw, clean);

    t.equals(clean['boundary.circle.lat'], 12.121212);
    t.equals(clean['boundary.circle.lon'], 21.212121);
    t.equals(clean['boundary.circle.radius'], 2.0);

    t.deepEquals(errorsAndWarnings, { errors: [], warnings: [] });
    t.end();
  });

  test('boundary.circle.radius specified should be clamped to MAX', (t) => {
    const raw = {
      'point.lat': '12.121212',
      'point.lon': '21.212121',
      'boundary.circle.radius': '10000'
    };
    const clean = {};
    const errorsAndWarnings = sanitizer.sanitize(raw, clean);

    t.equals(clean['boundary.circle.lat'], 12.121212);
    t.equals(clean['boundary.circle.lon'], 21.212121);
    t.equals(clean['boundary.circle.radius'], 5.0); // CIRCLE_MAX_RADIUS

    t.deepEquals(errorsAndWarnings, { errors: [], warnings: [] });
    t.end();
  });

  test('boundary.circle.radius specified should be clamped to MIN', (t) => {
    const raw = {
      'point.lat': '12.121212',
      'point.lon': '21.212121',
      'boundary.circle.radius': '0.000000000000001'
    };
    const clean = {};
    const errorsAndWarnings = sanitizer.sanitize(raw, clean);

    t.equals(clean['boundary.circle.lat'], 12.121212);
    t.equals(clean['boundary.circle.lon'], 21.212121);
    t.equals(clean['boundary.circle.radius'], 0.00001); // CIRCLE_MIN_RADIUS

    t.deepEquals(errorsAndWarnings, { errors: [], warnings: [] });
    t.end();
  });
};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`SANITIZE _geo_reverse ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
