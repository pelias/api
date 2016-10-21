var place  = require('../../../sanitizer/place'),
    sanitize = place.sanitize,
    middleware = place.middleware,
    defaultClean = { ids: [ { source: 'geonames', layer: 'venue', id: '123' } ], private: false };

// these are the default values you would expect when no input params are specified.
module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('sanitize interface', function(t) {
    t.equal(typeof sanitize, 'function', 'sanitize is a function');
    t.equal(sanitize.length, 2, 'sanitize interface');
    t.end();
  });
  test('middleware interface', function(t) {
    t.equal(typeof middleware, 'function', 'middleware is a function');
    t.equal(middleware.length, 3, 'sanitize has a valid middleware');
    t.end();
  });
};

module.exports.tests.sanitizers = function(test, common) {
  test('check sanitizer list', function (t) {
    var expected = ['singleScalarParameters', 'ids', 'private' ];
    t.deepEqual(Object.keys(place.sanitizer_list), expected);
    t.end();
  });
};

module.exports.tests.sanitize_private = function(test, common) {
  var invalid_values = [null, -1, 123, NaN, 'abc'];
  invalid_values.forEach(function(value) {
    test('invalid private param ' + value, function(t) {
      var req = { query: { ids:'geonames:venue:123', 'private': value } };
      sanitize(req, function(){
        t.deepEqual( req.errors, [], 'no errors' );
        t.deepEqual( req.warnings, [], 'no warnings' );
        t.equal(req.clean.private, false, 'default private set (to false)');
        t.end();
      });
    });
  });

  var valid_values = ['true', true, 1];
  valid_values.forEach(function(value) {
    test('valid private param ' + value, function(t) {
      var req = { query: { ids:'geonames:venue:123', 'private': value } };
      sanitize(req, function(){
        t.deepEqual( req.errors, [], 'no errors' );
        t.deepEqual( req.warnings, [], 'no warnings' );
        t.equal(req.clean.private, true, 'private set to true');
        t.end();
      });
    });
  });

  var valid_false_values = ['false', false, 0];
  valid_false_values.forEach(function(value) {
    test('test setting false explicitly ' + value, function(t) {
      var req = { query: { ids:'geonames:venue:123', 'private': value } };
      sanitize(req, function(){
        t.deepEqual( req.errors, [], 'no errors' );
        t.deepEqual( req.warnings, [], 'no warnings' );
        t.equal(req.clean.private, false, 'private set to false');
        t.end();
      });
    });
  });

  test('test default behavior', function(t) {
    var req = { query: { ids:'geonames:venue:123' } };
    sanitize(req, function(){
      t.deepEqual( req.errors, [], 'no errors' );
      t.deepEqual( req.warnings, [], 'no warnings' );
      t.equal(req.clean.private, false, 'private set to false');
      t.end();
    });
  });
};

module.exports.tests.invalid_params = function(test, common) {
  test('no params', function(t) {
    var req = { query: {} };
    sanitize( req, function(){
      t.equal( req.errors[0], 'invalid param \'ids\': length must be >0', 'error for missing `ids` param');
      t.deepEqual( req.warnings, [], 'no warnings' );
      t.end();
    });
  });
};

module.exports.tests.middleware_success = function(test, common) {
  test('middleware success', function(t) {
    var req = { query: { ids: 'geonames:venue:123' }};
    var next = function(){
      t.deepEqual( req.errors, [], 'no errors' );
      t.deepEqual( req.warnings, [], 'no warnings' );
      t.deepEqual(req.clean, defaultClean);
      t.end();
    };
    middleware( req, undefined, next );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('SANTIZE /place ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
