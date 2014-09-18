
var sanitize = require('../../../sanitiser/sanitise'),
    defaultError = 'invalid param \'input\': text length, must be >0',
    defaultClean = { input: 'test', lat: 0, layers: [ 'geoname', 'osmnode', 'osmway', 'admin0', 'admin1', 'admin2', 'neighborhood' ], lon: 0, size: 10, zoom: 10 };

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('sanitize interface', function(t) {
    t.equal(typeof sanitize, 'function', 'sanitize is a function');
    t.equal(sanitize.length, 2, 'sanitize interface');
    t.end();
  });
  test('middleware interface', function(t) {
    t.equal(typeof sanitize.middleware, 'function', 'middleware is a function');
    t.equal(sanitize.middleware.length, 3, 'sanitize is valid middleware');
    t.end();
  });
};

module.exports.tests.sanitize_input = function(test, common) {
  var inputs = {
    invalid: [ '', 100, null, undefined, new Date() ],
    valid: [ 'a', 'aa', 'aaaaaaaa' ]
  };
  inputs.invalid.forEach( function( input ){
    test('invalid input', function(t) {
      sanitize({ input: input, lat: 0, lon: 0 }, function( err, clean ){
        t.equal(err, 'invalid param \'input\': text length, must be >0', 'invalid input');
        t.equal(clean, undefined, 'clean not set');
        t.end();
      });
    });
  });
  inputs.valid.forEach( function( input ){
    test('valid input', function(t) {
      sanitize({ input: input, lat: 0, lon: 0 }, function( err, clean ){
        var expected = JSON.parse(JSON.stringify( defaultClean ));
        expected.input = input;
        t.equal(err, undefined, 'no error');
        t.deepEqual(clean, expected, 'clean set correctly');
        t.end();
      });
    });
  });
};

module.exports.tests.sanitize_lat = function(test, common) {
  var lats = {
    invalid: [ -1, -45, -90, 91, 120, 181 ],
    valid: [ 0, 45, 90, -0, '0', '45', '90' ]
  };
  lats.invalid.forEach( function( lat ){
    test('invalid lat', function(t) {
      sanitize({ input: 'test', lat: lat, lon: 0 }, function( err, clean ){
        t.equal(err, 'invalid param \'lat\': must be >0 and <90', 'invalid latitude');
        t.equal(clean, undefined, 'clean not set');
        t.end();
      });
    });
  });
  lats.valid.forEach( function( lat ){
    test('valid lat', function(t) {
      sanitize({ input: 'test', lat: lat, lon: 0 }, function( err, clean ){
        var expected = JSON.parse(JSON.stringify( defaultClean ));
        expected.lat = parseFloat( lat );
        t.equal(err, undefined, 'no error');
        t.deepEqual(clean, expected, 'clean set correctly');
        t.end();
      });
    });
  });
};

module.exports.tests.sanitize_lon = function(test, common) {
  var lons = {
    invalid: [ -360, -181, 181, 360 ],
    valid: [ -180, -1, -0, 0, 45, 90, '-180', '0', '180' ]
  };
  lons.invalid.forEach( function( lon ){
    test('invalid lon', function(t) {
      sanitize({ input: 'test', lat: 0, lon: lon }, function( err, clean ){
        t.equal(err, 'invalid param \'lon\': must be >-180 and <180', 'invalid longitude');
        t.equal(clean, undefined, 'clean not set');
        t.end();
      });
    });
  });
  lons.valid.forEach( function( lon ){
    test('valid lon', function(t) {
      sanitize({ input: 'test', lat: 0, lon: lon }, function( err, clean ){
        var expected = JSON.parse(JSON.stringify( defaultClean ));
        expected.lon = parseFloat( lon );
        t.equal(err, undefined, 'no error');
        t.deepEqual(clean, expected, 'clean set correctly');
        t.end();
      });
    });
  });
};

module.exports.tests.sanitize_zoom = function(test, common) {
  test('invalid zoom value', function(t) {
    sanitize({ zoom: 'a', input: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.equal(clean.zoom, 10, 'default zoom set');
      t.end();
    });
  });
  test('below min zoom value', function(t) {
    sanitize({ zoom: -100, input: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.equal(clean.zoom, 1, 'min zoom set');
      t.end();
    });
  });
  test('above max zoom value', function(t) {
    sanitize({ zoom: 9999, input: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.equal(clean.zoom, 18, 'max zoom set');
      t.end();
    });
  });
};

module.exports.tests.sanitize_size = function(test, common) {
  test('invalid size value', function(t) {
    sanitize({ size: 'a', input: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.equal(clean.size, 10, 'default size set');
      t.end();
    });
  });
  test('below min size value', function(t) {
    sanitize({ size: -100, input: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.equal(clean.size, 1, 'min size set');
      t.end();
    });
  });
  test('above max size value', function(t) {
    sanitize({ size: 9999, input: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.equal(clean.size, 40, 'max size set');
      t.end();
    });
  });
};

module.exports.tests.sanitize_layers = function(test, common) {
  test('unspecified', function(t) {
    sanitize({ layers: undefined, input: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.deepEqual(clean.layers, defaultClean.layers, 'default layers set');
      t.end();
    });
  });
  test('invalid layer', function(t) {
    sanitize({ layers: 'test_layer', input: 'test', lat: 0, lon: 0 }, function( err, clean ){
      var msg = 'invalid param \'layer\': must be one or more of geoname,osmnode,osmway,admin0,admin1,admin2,neighborhood';
      t.equal(err, msg, 'invalid layer requested');
      t.end();
    });
  });
};

module.exports.tests.invalid_params = function(test, common) {
  test('invalid input params', function(t) {
    sanitize( undefined, function( err, clean ){
      t.equal(err, defaultError, 'handle invalid params gracefully');
      t.end();
    });
  });
};

module.exports.tests.middleware_failure = function(test, common) {
  test('middleware failure', function(t) {
    var res = { status: function( code ){
      t.equal(code, 400, 'status set');
    }};
    var next = function( message ){
      t.equal(message, defaultError);
      t.end();
    };
    sanitize.middleware( {}, res, next );
  });
};

module.exports.tests.middleware_success = function(test, common) {
  test('middleware success', function(t) {
    var req = { query: { input: 'test', lat: 0, lon: 0 }};
    var next = function( message ){
      t.equal(message, undefined, 'no error message set');
      t.deepEqual(req.clean, defaultClean);
      t.end();
    };
    sanitize.middleware( req, undefined, next );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('SANTIZE /sanitise ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};