
var coarse  = require('../../../sanitiser/coarse'),
    _sanitize    = coarse.sanitize,
    middleware   = coarse.middleware,
    valid_layers = [ 'admin0', 'admin1', 'admin2', 'neighborhood', 'locality', 'local_admin' ],
    defaultClean = require('../sanitiser/_input').defaultClean,    
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

module.exports.tests.layers = function(test, common) {
  test('valid layers', function(t) {
    sanitize({ input: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.equal(err, undefined, 'no error');
      t.deepEqual(clean.layers, valid_layers, 'layers set correctly');
    });
    t.end();
  });
};

module.exports.tests.middleware_failure = function(test, common) {
  test('middleware failure', function(t) {
    var res = { status: function( code ){
      t.equal(code, 400, 'status set');
    }};
    var next = function( message ){
      var defaultError = 'invalid param \'input\': text length, must be >0';
      t.equal(message, defaultError);
      t.end();
    };
    middleware( {}, res, next );
  });
};

module.exports.tests.middleware_success = function(test, common) {
  test('middleware success', function(t) {
    var req = { query: { input: 'test', lat: 0, lon: 0 }};
    var clean = defaultClean;
    clean.layers = valid_layers;

    var next = function( message ){
      t.equal(message, undefined, 'no error message set');
      t.deepEqual(req.clean, clean);
      t.end();
    };
    middleware( req, undefined, next );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('SANTIZE /coarse ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};