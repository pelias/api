var es = require('elasticsearch'),
    middleware = require('../../../middleware/sendJSON');

module.exports.tests = {};

module.exports.tests.invalid = function(test, common) {
  test('invalid $res', function(t) {
    var res;

    middleware(null, res, function () {
      t.pass('next() called.');
      t.end();
    });
  });

  test('invalid $res.body', function(t) {
    var res = { body: 1 };

    middleware(null, res, function () {
      t.pass('next() called.');
      t.end();
    });
  });

  test('invalid $res.body.geocoding', function(t) {
    var res = { body: { geocoding: 1 } };

    middleware(null, res, function () {
      t.pass('next() called.');
      t.end();
    });
  });
};

module.exports.tests.default_status = function(test, common) {
  test('no errors', function(t) {
    var res = { body: { geocoding: {} } };

    res.status = function( code ){
      return { json: function( body ){
        t.equal( code, 200, '200 OK' );
        t.deepEqual( body, res.body, 'body set' );
        t.end();
      }};
    };

    middleware(null, res);
  });

  test('empty errors array', function(t) {
    var res = { body: { geocoding: {}, errors: [] } };

    res.status = function( code ){
      return { json: function( body ){
        t.equal( code, 200, '200 OK' );
        t.deepEqual( body, res.body, 'body set' );
        t.end();
      }};
    };

    middleware(null, res);
  });
};

module.exports.tests.default_error_status = function(test, common) {
  test('default error code', function(t) {
    var res = { body: { geocoding: {
      errors: [ 'an error' ]
    }}};

    res.status = function( code ){
      return { json: function( body ){
        t.equal( code, 400, '400 Bad Request' );
        t.deepEqual( body, res.body, 'body set' );
        t.end();
      }};
    };

    middleware(null, res);
  });
};

module.exports.tests.generic_server_error = function(test, common) {
  test('generic server error', function(t) {
    var res = { body: { geocoding: {
      errors: [ new Error('an error') ]
    }}};

    res.status = function( code ){
      return { json: function( body ){
        t.equal( code, 500, 'Internal Server Error' );
        t.deepEqual( body, res.body, 'body set' );
        t.end();
      }};
    };

    middleware(null, res);
  });
};

module.exports.tests.generic_elasticsearch_error = function(test, common) {
  test('generic elasticsearch error', function(t) {
    var res = { body: { geocoding: {
      errors: [ new es.errors.Generic('an error') ]
    }}};

    res.status = function( code ){
      return { json: function( body ){
        t.equal( code, 500, 'Internal Server Error' );
        t.deepEqual( body, res.body, 'body set' );
        t.end();
      }};
    };

    middleware(null, res);
  });
};

module.exports.tests.request_timeout = function(test, common) {
  test('request timeout', function(t) {
    var res = { body: { geocoding: {
      errors: [ new es.errors.RequestTimeout('an error') ]
    }}};

    res.status = function( code ){
      return { json: function( body ){
        t.equal( code, 408, 'Request Timeout' );
        t.deepEqual( body, res.body, 'body set' );
        t.end();
      }};
    };

    middleware(null, res);
  });
};

module.exports.tests.no_connections = function(test, common) {
  test('no connections', function(t) {
    var res = { body: { geocoding: {
      errors: [ new es.errors.NoConnections('an error') ]
    }}};

    res.status = function( code ){
      return { json: function( body ){
        t.equal( code, 502, 'Bad Gateway' );
        t.deepEqual( body, res.body, 'body set' );
        t.end();
      }};
    };

    middleware(null, res);
  });
};

module.exports.tests.connection_fault = function(test, common) {
  test('connection fault', function(t) {
    var res = { body: { geocoding: {
      errors: [ new es.errors.ConnectionFault('an error') ]
    }}};

    res.status = function( code ){
      return { json: function( body ){
        t.equal( code, 502, 'Bad Gateway' );
        t.deepEqual( body, res.body, 'body set' );
        t.end();
      }};
    };

    middleware(null, res);
  });
};

module.exports.tests.serialization = function(test, common) {
  test('serialization', function(t) {
    var res = { body: { geocoding: {
      errors: [ new es.errors.Serialization('an error') ]
    }}};

    res.status = function( code ){
      return { json: function( body ){
        t.equal( code, 500, 'Internal Server Error' );
        t.deepEqual( body, res.body, 'body set' );
        t.end();
      }};
    };

    middleware(null, res);
  });
};

module.exports.tests.search_phase_execution_exception = function(test, common) {
  test('search phase execution exception', function(t) {
    var res = { body: { geocoding: {
      errors: [ 'SearchPhaseExecutionException[ foo ]' ]
    }}};

    res.status = function( code ){
      return { json: function( body ){
        t.equal( code, 500, 'Internal Server Error' );
        t.deepEqual( body, res.body, 'body set' );
        t.end();
      }};
    };

    middleware(null, res);
  });
};

module.exports.tests.unknown_exception = function(test, common) {
  test('unknown exception', function(t) {
    var res = { body: { geocoding: {
      errors: [ 'MadeUpExceptionName[ foo ]' ]
    }}};

    res.status = function( code ){
      return { json: function( body ){
        t.equal( code, 400, '400 Bad Request' );
        t.deepEqual( body, res.body, 'body set' );
        t.end();
      }};
    };

    middleware(null, res);
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('[middleware] sendJSON: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
