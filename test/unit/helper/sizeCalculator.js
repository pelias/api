
var calcSize = require('../../../middleware/sizeCalculator.js')();

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('interface', function(t) {
    t.equal(typeof calcSize, 'function', 'valid function');
    t.end();
  });
};

module.exports.tests.valid = function(test, common) {
  var req = { clean: {} };
  function setup(val) {
    if (isNaN(val)) {
      delete req.clean.size;
    }
    else {
      req.clean.size = val;
    }
    delete req.clean.querySize;
  }

  test('size=0', function (t) {
    setup(0);
    calcSize(req, {}, function () {
      t.equal(req.clean.querySize, 20);
      t.end();
    });
  });

  test('size=1', function (t) {
    setup(1);
    calcSize(req, {}, function () {
      t.equal(req.clean.querySize, 20);
      t.end();
    });
  });

  test('size=10', function (t) {
    setup(10);
    calcSize(req, {}, function () {
      t.equal(req.clean.querySize, 20);
      t.end();
    });
  });

  test('size=20', function (t) {
    setup(20);
    calcSize(req, {}, function () {
      t.equal(req.clean.querySize, 40);
      t.end();
    });
  });

  test('no size', function (t) {
    setup();
    calcSize(req, {}, function () {
      t.equal(req.clean.hasOwnProperty('querySize'), false);
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
