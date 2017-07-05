var setup = require('../../../sanitizer/_location_bias');

module.exports.tests = {};

module.exports.tests.setLocationBias = function(test, common) {
  test('set focus point', t => {
    var defaultParameters = { // specify focus point latitude and longitude
      'focus.point.lat': 12.12121212,
      'focus.point.lon': 21.21212121
    };
    var locationBias = setup(defaultParameters);
    var req = {
      clean: {}
    };
    var expected = {
      clean: {
          'focus.point.lat': 12.12121212,
          'focus.point.lon': 21.21212121
      }
    };

    locationBias(req, undefined, () => {
      t.deepEqual(req, expected, 'focus point should be set');
      t.end();
    });
  });

  test('undefined req.clean', t => {
    var defaultParameters = {
        'focus.point.lat': 12.12121212,
        'focus.point.lon': 21.21212121
    };
    var locationBias = setup(defaultParameters);
    var req = {};
    var expected = {};

    locationBias(req, undefined, () => {
      t.deepEqual(req, expected, 'should be unmodified' );
      t.end();
    });
  });

  test('focusPointLat is undefined', t => {
    var defaultParameters = {
      'focus.point.lon': 12.2121212
    };
    var locationBias = setup(defaultParameters);
    var req = {
       clean: {}
    };
    var expected = {
       clean: {}
    };

    locationBias(req, undefined, () => {
      t.deepEqual(req, expected, 'should be unmodified' );
      t.end();
    });
  });

  test('focusPointLon is undefined', t => {
    var defaultParameters = {
      'focus.point.lat': 12.2121212
    };
    var locationBias = setup(defaultParameters);
    var req = {
       clean: {}
    };
    var expected = {
       clean: {}
    };

    locationBias(req, undefined, () => {
      t.deepEqual(req, expected, 'should be unmodified' );
      t.end();
    });
  });

};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('[middleware] locationBias: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
