
// @todo: refactor this test, it's pretty messy, brittle and hard to follow

var reverse  = require('../../../sanitizer/reverse'),
    sanitize = reverse.sanitize,
    middleware = reverse.middleware,
    defaults = require('../../../query/reverse_defaults'),
    defaultError = 'missing param \'lat\'',
    defaultClean =  { 'point.lat': 0,
                      'point.lon': 0,
                      'boundary.circle.lat': 0,
                      'boundary.circle.lon': 0,
                      'boundary.circle.radius': parseFloat(defaults['boundary:circle:radius']),
                      size: 10,
                      private: false
                    };

// these are the default values you would expect when no input params are specified.
// @todo: why is this different from $defaultClean?
var emptyClean = { private: false, size: 10 };

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

module.exports.tests.sanitizers = function(test, common) {
  test('check sanitizer list', function (t) {
    var expected = ['quattroshapes_deprecation', 'singleScalarParameters', 'layers',
      'sources', 'sources_and_layers', 'size', 'private', 'geo_reverse', 'boundary_country'];
    t.deepEqual(Object.keys(reverse.sanitizer_list), expected);
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
      var req = { query: { 'point.lat': lat, 'point.lon': 0 } };
      sanitize(req, function(){
        t.equal(req.errors[0], 'invalid param \'point.lat\': must be >-90 and <90', lat + ' is an invalid latitude');
        t.deepEqual(req.clean, emptyClean, 'clean only has default values set');
      });
    });
    t.end();
  });
  test('valid lat', function(t) {
    lats.valid.forEach( function( lat ){
      var req = { query: { 'point.lat': lat, 'point.lon': 0 } };
      sanitize(req, function(){
        var expected_lat = parseFloat( lat );
        t.deepEqual(req.errors, [], 'no errors');
      });
    });
    t.end();
  });
  test('missing lat', function(t) {
    lats.missing.forEach( function( lat ){
      var req = { query: { 'point.lat': lat, 'point.lon': 0 } };
      sanitize(req, function(){
        t.equal(req.errors[0], 'missing param \'point.lat\'', 'latitude is a required field');
        t.deepEqual(req.clean, emptyClean, 'clean only has default values set');
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
      var req = { query: { 'point.lat': 0, 'point.lon': lon } };
      sanitize(req, function(){
        var expected_lon = parseFloat( lon );
        t.deepEqual(req.errors, [], 'no errors');
      });
    });
    t.end();
  });
  test('missing lon', function(t) {
    lons.missing.forEach( function( lon ){
      var req = { query: { 'point.lat': 0, 'point.lon': lon } };

      // @todo: why is lat set?
      var expected = { 'point.lat': 0, private: false, size: 10 };
      sanitize(req, function(){
        t.equal(req.errors[0], 'missing param \'point.lon\'', 'longitude is a required field');
        t.deepEqual(req.clean, expected, 'clean only has default values set');
      });
    });
    t.end();
  });
};

module.exports.tests.sanitize_size = function(test, common) {
  test('invalid size value', function(t) {
    var req = { query: { size: 'a', 'point.lat': 0, 'point.lon': 0 } };
    sanitize(req, function(){
      t.equal(req.clean.size, 10, 'default size set');
      t.end();
    });
  });
  test('below min size value', function(t) {
    var req = { query: { size: -100, 'point.lat': 0, 'point.lon': 0 } };
    sanitize(req, function(){
      t.equal(req.clean.size, 1, 'min size set');
      t.end();
    });
  });
  test('above max size value', function(t) {
    var req = { query: { size: 9999, 'point.lat': 0, 'point.lon': 0 } };
    sanitize(req, function(){
      t.equal(req.clean.size, 40, 'max size set');
      t.end();
    });
  });
};

module.exports.tests.sanitize_private = function(test, common) {
  var invalid_values = [null, -1, 123, NaN, 'abc'];
  invalid_values.forEach(function(value) {
    test('invalid private param ' + value, function(t) {
      var req = { query: { 'point.lat': 0, 'point.lon': 0, 'private': value } };
      sanitize(req, function(){
        t.equal(req.clean.private, false, 'default private set (to false)');
        t.end();
      });
    });
  });

  var valid_values = ['true', true, 1, '1'];
  valid_values.forEach(function(value) {
    test('valid private param ' + value, function(t) {
      var req = { query: { 'point.lat': 0, 'point.lon': 0, 'private': value } };
      sanitize(req, function(){
        t.equal(req.clean.private, true, 'private set to true');
        t.end();
      });
    });
  });

  var valid_false_values = ['false', false, 0];
  valid_false_values.forEach(function(value) {
    test('test setting false explicitly ' + value, function(t) {
      var req = { query: { 'point.lat': 0, 'point.lon': 0, 'private': value } };
      sanitize(req, function(){
        t.equal(req.clean.private, false, 'private set to false');
        t.end();
      });
    });
  });

  test('test default behavior', function(t) {
    var req = { query: { 'point.lat': 0, 'point.lon': 0 } };
    sanitize(req, function(){
      t.equal(req.clean.private, false, 'private set to false');
      t.end();
    });
  });
};

module.exports.tests.middleware_success = function(test, common) {
  test('middleware success', function(t) {
    var req = { query: { 'point.lat': 0, 'point.lon': 0 }};
    var next = function(){
      t.deepEqual(req.errors, [], 'no error message set');
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
