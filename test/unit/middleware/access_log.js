var access_log = require('../../../middleware/access_log');

module.exports.tests = {};

module.exports.tests.customRemoteAddress = function(test) {
  test('non-DNT request shows IP in logs', function(t) {
    var req = {
      ip: '8.8.8.8',
      query: '/v1/search?....'
    };

    var result = access_log.customRemoteAddr(req, {});

    t.equals(result, '8.8.8.8', 'IP would be sent to logs');
    t.end();
  });

  test('DNT request does not show IP in logs', function(t) {
    var req = {
      ip: '8.8.8.8',
      query: '/v1/search?....',
      headers: {
        DNT: 1
      }
    };

    var result = access_log.customRemoteAddr(req, {});

    t.equals(result, '[IP removed]', 'IP removed from logs');
    t.end();
  });
};

module.exports.tests.customURL = function(test) {
  test('non-DNT request shows full query in logs', function(t) {
    var req = {
      ip: '8.8.8.8',
      query: {
        text: 'london'
      },
      _parsedUrl: {
        pathname: '/v1/search',
        path: '/v1/search?text=london'
      }
    };

    var result = access_log.customURL(req, {});

    t.equals(result, '/v1/search?text=london', 'query not removed from logs');
    t.end();
  });

  test('DNT request removes sensitive fields from logs', function(t) {
    var req = {
      ip: '8.8.8.8',
      query: {
        text: 'london'
      },
      _parsedUrl: {
        pathname: '/v1/search',
        path: '/v1/search?text=london'
      },
      headers: {
        DNT: 1
      }
    };

    var result = access_log.customURL(req, {});

    t.equals(result, '/v1/search?text=%5Bremoved%5D', 'query has sensitive fields removed');
    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('[middleware] access_log: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
