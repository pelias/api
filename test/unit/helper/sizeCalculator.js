var calcSizeMiddleware = require('../../../middleware/sizeCalculator.js');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('interface', function(t) {
    t.equal(typeof calcSizeMiddleware, 'function', 'valid function');
    t.end();
  });
};

module.exports.tests.valid = function(test, common) {
  var req = { clean: {} };
  function setupQuery(val) {
    if (isNaN(val)) {
      delete req.clean.size;
    }
    else {
      req.clean.size = val;
    }
    delete req.clean.querySize;
  }

  test('size=0', function (t) {
    setupQuery(0);
    const calcSize = calcSizeMiddleware();
    calcSize(req, {}, function () {
      t.equal(req.clean.querySize, 20);
      t.end();
    });
  });

  test('size=1', function (t) {
    setupQuery(1);
    const calcSize = calcSizeMiddleware();
    calcSize(req, {}, function () {
      t.equal(req.clean.querySize, 20);
      t.end();
    });
  });

  test('size=10', function (t) {
    setupQuery(10);
    const calcSize = calcSizeMiddleware();
    calcSize(req, {}, function () {
      t.equal(req.clean.querySize, 20);
      t.end();
    });
  });

  test('size=20', function (t) {
    setupQuery(20);
    const calcSize = calcSizeMiddleware();
    calcSize(req, {}, function () {
      t.equal(req.clean.querySize, 40);
      t.end();
    });
  });

  test('no size', function (t) {
    setupQuery();
    const calcSize = calcSizeMiddleware();
    calcSize(req, {}, function () {
      t.equal(req.clean.hasOwnProperty('querySize'), false);
      t.end();
    });
  });

  test('no size, min query size 10', function (t) {
    setupQuery();
    const calcSize = calcSizeMiddleware(10);
    calcSize(req, {}, function () {
      t.equal(req.clean.hasOwnProperty('querySize'), false);
      t.end();
    });
  });

  test('size 5, min query size 10', function (t) {
    setupQuery(5);
    const calcSize = calcSizeMiddleware(10);
    calcSize(req, {}, function () {
      t.equal(req.clean.querySize, 10);
      t.end();
    });
  });

  test('size 3, min query size 2', function (t) {
    setupQuery(3);
    const calcSize = calcSizeMiddleware(2);
    calcSize(req, {}, function () {
      t.equal(req.clean.querySize, 6);
      t.end();
    });
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('sizeCalculator: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
