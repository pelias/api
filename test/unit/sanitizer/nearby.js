
var nearby  = require('../../../sanitizer/nearby');
var defaults = require('../../../query/reverse_defaults');
var sanitize = nearby.sanitize;
var middleware = nearby.middleware;

var defaultClean =  { 'point.lat': 0,
                      'point.lon': 0,
                      'boundary.circle.lat': 0,
                      'boundary.circle.lon': 0,
                      'boundary.circle.radius': parseFloat(defaults['boundary:circle:radius']),
                      size: 10,
                      private: false
                    };

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
      'sources', 'sources_and_layers', 'size', 'private', 'geo_reverse', 'boundary_country', 'categories'];
    t.deepEqual(Object.keys(nearby.sanitizer_list), expected);
    t.end();
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
    return tape('SANTIZE /nearby ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
