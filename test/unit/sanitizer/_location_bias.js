const setup = require('../../../sanitizer/_location_bias');

module.exports.tests = {};

module.exports.tests.setLocationBias = function(test, common) {
  test('set focus point', t => {
    const defaultParameters = { // specify focus point latitude and longitude
      'focus.point.lat': 12.12121212,
      'focus.point.lon': 21.21212121
    };
    const locationBias = setup(defaultParameters);
    const raw = {};
    const expected = {
          'focus.point.lat': 12.12121212,
          'focus.point.lon': 21.21212121
    };

    locationBias(raw, undefined);
    t.deepEqual(raw, expected, 'focus point should be set');
    t.end();

  });

  test('undefined raw', t => {
    const defaultParameters = {
        'focus.point.lat': 12.12121212,
        'focus.point.lon': 21.21212121
    };
    const locationBias = setup(defaultParameters);

    locationBias(undefined, undefined);
    t.deepEqual(undefined, undefined, 'should be unmodified' );
    t.end();
  });

  test('focusPointLat is undefined', t => {
    const defaultParameters = {
      'focus.point.lon': 12.2121212
    };
    const locationBias = setup(defaultParameters);
    const raw = {};
    const expected = {};

    locationBias(raw, undefined);
    t.deepEqual(raw, expected, 'should be unmodified' );
    t.end();
  });

  test('focusPointLon is undefined', t => {
    const defaultParameters = {
      'focus.point.lat': 12.2121212
    };
    const locationBias = setup(defaultParameters);
    const raw = {};
    const expected = {};

    locationBias(raw, undefined);
      t.deepEqual(raw, expected, 'should be unmodified' );
      t.end();
  });

};

module.exports.all = (tape, common) => {

  function test(name, testFunction) {
    return tape(`SANITIZE _location_bias: ${name}`, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
