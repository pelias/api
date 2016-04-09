var limiter = require('../../../middleware/bulkSizeLimit');
module.exports.tests = {};

function responseChecker(t, valid) {
  var res = {
    json: function(j) { return res; }
  };

  if(valid) {
    res.status = function(code) {
      t.fail('middleware returned a status but should have called next()');
      return res;
    };
  } else {
    res.status = function(code) {
      t.equal(code, 400, 'code should be 400 Bad Request');
      return res;
    };
  }

  return res;
}

function makeArray(len) {
  var result = [];
  for(var i = 0; i < len; i++) {
    result.push({});
  }
  return result;
}

module.exports.tests.no_size_limit = function(test, common) {
  test('singleton with no size limit', function(t) {
    var req = { clean: {} };
    var res = responseChecker(t, true);

    var middleware = limiter();
    var calledNext;
    middleware(req, res, function() { calledNext = true; });
    t.equal(calledNext, true, 'should call next()');
    t.end();
  });

  test('array with no size limit', function(t) {
    var req = { clean: makeArray(4) };
    var res = responseChecker(t, true);

    var middleware = limiter();
    var calledNext;
    middleware(req, res, function() { calledNext = true; });
    t.equal(calledNext, true, 'should call next()');
    t.end();
  });
};

module.exports.tests.valid_with_size_limit = function(test, common) {
  test('singleton with size limit', function(t) {
    var req = { clean: {} };
    var res = responseChecker(t, true);

    var middleware = limiter({bulkSizeLimit: 5});
    var calledNext;
    middleware(req, res, function() { calledNext = true; });
    t.equal(calledNext, true, 'should call next()');
    t.end();
  });

  test('valid array with size limit', function(t) {
    var req = { clean: makeArray(5) };
    var res = responseChecker(t, true);

    var middleware = limiter({bulkSizeLimit: 5});
    var calledNext;
    middleware(req, res, function() { calledNext = true; });
    t.equal(calledNext, true, 'should call next()');
    t.end();
  });
};

module.exports.tests.invalid_with_size_limit = function(test, common) {
  test('too-large array with size limit', function(t) {
    var req = { clean: makeArray(6) };
    var res = responseChecker(t, false);

    var middleware = limiter({bulkSizeLimit: 5});
    middleware(req, res, function() { t.fail('Should not call next()'); });
    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('[middleware] bulkSizeLimit ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ) {
    module.exports.tests[testCase](test, common);
  }
};
