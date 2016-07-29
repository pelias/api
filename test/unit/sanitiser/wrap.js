
var wrap = require('../../../sanitiser/wrap');

module.exports.tests = {};

module.exports.tests.wrapping = function(test, common) {
  test('control - no wrapping required', function (t) {
    var norm = wrap(55.555, 22.222);
    t.equal(norm.lat, 55.555);
    t.equal(norm.lon, 22.222);
    t.end();
  });
  test('positive longitude wrapping', function (t) {
    var norm = wrap(0, 181);
    t.equal(norm.lat, 0);
    t.equal(norm.lon, -179);
    t.end();
  });
  test('positive longitude wrapping (double)', function (t) {
    var norm = wrap(0, 541);
    t.equal(norm.lat, 0);
    t.equal(norm.lon, -179);
    t.end();
  });
  test('negative longitude wrapping', function (t) {
    var norm = wrap(0, -181);
    t.equal(norm.lat, 0);
    t.equal(norm.lon, 179);
    t.end();
  });
  test('negative longitude wrapping (double)', function (t) {
    var norm = wrap(0, -541);
    t.equal(norm.lat, 0);
    t.equal(norm.lon, 179);
    t.end();
  });
  test('positive latitudinal wrapping', function (t) {
    var norm = wrap(91, 0);
    t.equal(norm.lat, 89);
    t.equal(norm.lon, 180);
    t.end();
  });
  test('positive latitudinal wrapping (double)', function (t) {
    var norm = wrap(271, 0);
    t.equal(norm.lat, 89);
    t.equal(norm.lon, 180);
    t.end();
  });
  test('negative latitudinal wrapping', function (t) {
    var norm = wrap(-91, 0);
    t.equal(norm.lat, -89);
    t.equal(norm.lon, 180);
    t.end();
  });
  test('negative latitudinal wrapping (double)', function (t) {
    var norm = wrap(-271, 0);
    t.equal(norm.lat, -89);
    t.equal(norm.lon, 180);
    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('SANTIZE wrap ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
