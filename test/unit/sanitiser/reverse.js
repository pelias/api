
var reverse  = require('../../../sanitiser/reverse'),
    _sanitize = reverse.sanitize,
    middleware = reverse.middleware,
    defaultError = 'missing param \'lat\'',
    defaultClean =  { lat:0,
                      types: {
                      },
                      lon: 0,
                      size: 10,
                      details: true,
                      categories: [],
                      boundary: { country: undefined }
                    },
    sanitize = function(query, cb) { _sanitize({'query':query}, cb); };

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('sanitize interface', function(t) {
    t.equal(typeof sanitize, 'function', 'sanitize is a function');
    t.equal(sanitize.length, 2, 'sanitize interface');
    t.end();
  });
  test('middleware interface', function(t) {
    t.equal(typeof middleware, 'function', 'middleware is a function');
    t.equal(middleware.length, 3, 'sanitizee has a valid middleware');
    t.end();
  });
};

module.exports.tests.sanitisers = function(test, common) {
  test('check sanitiser list', function (t) {
    var expected = ['layers', 'sources', 'size', 'details', 'geo_reverse', 'categories', 'boundary_country'];
    t.deepEqual(Object.keys(reverse.sanitiser_list), expected);
    t.end();
  });
};

module.exports.tests.sanitize_lat = function(test, common) {
  var lats = {
    invalid: [],
    valid: [ 0, 45, 90, -0, '0', '45', '90', -181, -120, -91, 91, 120, 181 ],
    missing: ['', undefined, null]
  };
  test('invalid lat', function(t) {
    lats.invalid.forEach( function( lat ){
      sanitize({ 'point.lat': lat, 'point.lon': 0 }, function( err, clean ){
        t.equal(err, 'invalid param \'lat\': must be >-90 and <90', lat + ' is an invalid latitude');
        t.equal(clean, undefined, 'clean not set');
      });
    });
    t.end();
  });
  test('valid lat', function(t) {
    lats.valid.forEach( function( lat ){
      sanitize({ 'point.lat': lat, 'point.lon': 0 }, function( err, clean ){
        var expected = JSON.parse(JSON.stringify( defaultClean ));
        expected.lat = parseFloat( lat );
        t.equal(err, undefined, 'no error');
        t.equal(clean.lat, parseFloat(lat), 'clean set correctly (' + lat + ')');
      });
    });
    t.end();
  });
  test('missing lat', function(t) {
    lats.missing.forEach( function( lat ){
      sanitize({ 'point.lat': lat, 'point.lon': 0 }, function( err, clean ){
        t.equal(err, 'missing param \'lat\'', 'latitude is a required field');
        t.equal(clean, undefined, 'clean not set');
      });
    });
    t.end();
  });
};

module.exports.tests.sanitize_lon = function(test, common) {
  var lons = {
    valid: [ -360, -181, 181, -180, -1, -0, 0, 45, 90, '-180', '0', '180' ],
    missing: ['', undefined, null]
  };
  test('valid lon', function(t) {
    lons.valid.forEach( function( lon ){
      sanitize({ 'point.lat': 0, 'point.lon': lon }, function( err, clean ){
        var expected = JSON.parse(JSON.stringify( defaultClean ));
        expected.lon = parseFloat( lon );
        t.equal(err, undefined, 'no error');
        t.equal(clean.lon, parseFloat(lon), 'clean set correctly (' + lon + ')');
      });
    });
    t.end();
  });
  test('missing lon', function(t) {
    lons.missing.forEach( function( lon ){
      sanitize({ 'point.lat': 0, 'point.lon': lon }, function( err, clean ){
        t.equal(err, 'missing param \'lon\'', 'longitude is a required field');
        t.equal(clean, undefined, 'clean not set');
      });
    });
    t.end();
  });
};


module.exports.tests.sanitize_size = function(test, common) {
  test('invalid size value', function(t) {
    sanitize({ size: 'a', 'point.lat': 0, 'point.lon': 0 }, function( err, clean ){
      t.equal(clean.size, 10, 'default size set');
      t.end();
    });
  });
  test('below min size value', function(t) {
    sanitize({ size: -100, 'point.lat': 0, 'point.lon': 0 }, function( err, clean ){
      t.equal(clean.size, 1, 'min size set');
      t.end();
    });
  });
  test('above max size value', function(t) {
    sanitize({ size: 9999, 'point.lat': 0, 'point.lon': 0 }, function( err, clean ){
      t.equal(clean.size, 40, 'max size set');
      t.end();
    });
  });
};

module.exports.tests.sanitize_details = function(test, common) {
  var invalid_values = [null, -1, 123, NaN, 'abc'];
  invalid_values.forEach(function(details) {
    test('invalid details param ' + details, function(t) {
      sanitize({ 'point.lat': 0, 'point.lon': 0, details: details }, function( err, clean ){
        t.equal(clean.details, false, 'details set to false');
        t.end();
      });
    });
  });

  var valid_values = [true, 'true', 1, '1', 'yes', 'y'];
  valid_values.forEach(function(details) {
    test('valid details param ' + details, function(t) {
      sanitize({ 'point.lat': 0, 'point.lon': 0, details: details }, function( err, clean ){
        t.equal(clean.details, true, 'details set to true');
        t.end();
      });
    });
  });

  test('test default behavior', function(t) {
    sanitize({ 'point.lat': 0, 'point.lon': 0 }, function( err, clean ){
      t.equal(clean.details, true, 'details set to true');
      t.end();
    });
  });

  var valid_false_values = ['false', false, 0, '0', 'no', 'n'];
  valid_false_values.forEach(function(details) {
    test('test setting false explicitly ' + details, function(t) {
      sanitize({ 'point.lat': 0, 'point.lon': 0, details: details }, function( err, clean ){
        t.equal(clean.details, false, 'details set to false');
        t.end();
      });
    });
  });
};

module.exports.tests.sanitize_categories = function(test, common) {
  var queryParams = { 'point.lat': 0, 'point.lon': 0 };
  test('unspecified', function(t) {
    queryParams.categories = undefined;
    sanitize(queryParams, function( err, clean ){
      t.deepEqual(clean.categories, defaultClean.categories, 'default to empty categories array');
      t.end();
    });
  });
  test('single category', function(t) {
    queryParams.categories = 'food';
    sanitize(queryParams, function( err, clean ){
      t.deepEqual(clean.categories, ['food'], 'category set');
      t.end();
    });
  });
  test('multiple categories', function(t) {
    queryParams.categories = 'food,education,nightlife';
    sanitize(queryParams, function( err, clean ){
      t.deepEqual(clean.categories, ['food', 'education', 'nightlife'], 'categories set');
      t.end();
    });
  });
  test('whitespace and empty strings', function(t) {
    queryParams.categories = 'food, , nightlife ,';
    sanitize(queryParams, function( err, clean ){
      t.deepEqual(clean.categories, ['food', 'nightlife'], 'categories set');
      t.end();
    });
  });
  test('all empty strings', function(t) {
    queryParams.categories = ', ,  ,';
    sanitize(queryParams, function( err, clean ){
      t.deepEqual(clean.categories, defaultClean.categories, 'empty strings filtered out');
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
      t.equals(message, defaultError);
      t.end();
    };
    middleware( {}, res, next );
  });
};

module.exports.tests.middleware_success = function(test, common) {
  test('middleware success', function(t) {
    var req = { query: { 'point.lat': 0, 'point.lon': 0 }};
    var next = function( message ){
      t.equal(message, undefined, 'no error message set');
      t.deepEqual(req.clean, defaultClean);
      t.end();
    };
    middleware( req, undefined, next );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('SANTIZE /reverse ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
