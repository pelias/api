
var sanitize = require('../../../sanitiser/suggest');

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

module.exports.tests.middleware_failure = function(test, common) {
  test('middleware failure', function(t) {
    var res = { status: function( code ){
      t.equal(code, 400, 'status set');
    }};
    var next = function( message ){
      t.equal(message,'invalid param \'input\': text length, must be >0');
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
      t.deepEqual(req.clean,  {
        input: 'test', lat: 0, lon: 0,
        layers: [ 'geoname', 'osmnode', 'osmway', 'admin0', 'admin1', 'admin2', 'neighborhood' ],
        size: 10, zoom: 10
      });
      t.end();
    };
    sanitize.middleware( req, undefined, next );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('SANTIZE /suggest ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};