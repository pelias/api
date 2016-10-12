
var wrap = require('../../../sanitizer/wrap');

module.exports.tests = {};

module.exports.tests.control = function(test, common) {
  test('control - no wrapping required', function (t) {
    var norm = wrap(55.555, 22.222);
    t.equal(norm.lat, 55.555);
    t.equal(norm.lon, 22.222);
    t.end();
  });
};

module.exports.tests.latitude_positive = function(test, common) {
  test('positive latitude wrapping - 1 degree', function (t) {
    var norm = wrap(1, 0);
    t.equal(norm.lat, 1);
    t.equal(norm.lon, 0);
    t.end();
  });
  test('positive latitude wrapping - 91 degrees', function (t) {
    var norm = wrap(91, 0);
    t.equal(norm.lat, 89);
    t.equal(norm.lon, 180);
    t.end();
  });
  test('positive latitude wrapping - 181 degrees', function (t) {
    var norm = wrap(181, 0);
    t.equal(norm.lat, -1);
    t.equal(norm.lon, 180);
    t.end();
  });
  test('positive latitude wrapping - 271 degrees', function (t) {
    var norm = wrap(271, 0);
    t.equal(norm.lat, -89);
    t.equal(norm.lon, 0);
    t.end();
  });
  test('positive latitude wrapping - 361 degrees', function (t) {
    var norm = wrap(361, 0);
    t.equal(norm.lat, 1);
    t.equal(norm.lon, 0);
    t.end();
  });
  test('positive latitude wrapping - 631 degrees', function (t) {
    var norm = wrap(631, 0);
    t.equal(norm.lat, -89);
    t.equal(norm.lon, 0);
    t.end();
  });
  test('positive latitude wrapping - 721 degrees', function (t) {
    var norm = wrap(721, 0);
    t.equal(norm.lat, 1);
    t.equal(norm.lon, 0);
    t.end();
  });
};

module.exports.tests.latitude_negative = function(test, common) {
  test('negative latitude wrapping - 1 degree', function (t) {
    var norm = wrap(-1, 0);
    t.equal(norm.lat, -1);
    t.equal(norm.lon, 0);
    t.end();
  });
  test('negative latitude wrapping - 91 degrees', function (t) {
    var norm = wrap(-91, 0);
    t.equal(norm.lat, -89);
    t.equal(norm.lon, 180);
    t.end();
  });
  test('negative latitude wrapping - 181 degrees', function (t) {
    var norm = wrap(-181, 0);
    t.equal(norm.lat, 1);
    t.equal(norm.lon, 180);
    t.end();
  });
  test('negative latitude wrapping - 271 degrees', function (t) {
    var norm = wrap(-271, 0);
    t.equal(norm.lat, 89);
    t.equal(norm.lon, 0);
    t.end();
  });
  test('negative latitude wrapping - 361 degrees', function (t) {
    var norm = wrap(-361, 0);
    t.equal(norm.lat, -1);
    t.equal(norm.lon, 0);
    t.end();
  });
  test('negative latitude wrapping - 631 degrees', function (t) {
    var norm = wrap(-631, 0);
    t.equal(norm.lat, 89);
    t.equal(norm.lon, 0);
    t.end();
  });
  test('positive latitude wrapping - 721 degrees', function (t) {
    var norm = wrap(721, 0);
    t.equal(norm.lat, 1);
    t.equal(norm.lon, 0);
    t.end();
  });
};

module.exports.tests.longitude_positive = function(test, common) {
  test('positive longitude wrapping - 1 degree', function (t) {
    var norm = wrap(0, 1);
    t.equal(norm.lat, 0);
    t.equal(norm.lon, 1);
    t.end();
  });
  test('positive longitude wrapping - 181 degrees', function (t) {
    var norm = wrap(0, 181);
    t.equal(norm.lat, 0);
    t.equal(norm.lon, -179);
    t.end();
  });
  test('positive longitude wrapping - 271 degrees', function (t) {
    var norm = wrap(0, 271);
    t.equal(norm.lat, 0);
    t.equal(norm.lon, -89);
    t.end();
  });
  test('positive longitude wrapping - 361 degrees', function (t) {
    var norm = wrap(0, 361);
    t.equal(norm.lat, 0);
    t.equal(norm.lon, 1);
    t.end();
  });
  test('positive longitude wrapping - 631 degrees', function (t) {
    var norm = wrap(0, 631);
    t.equal(norm.lat, 0);
    t.equal(norm.lon, -89);
    t.end();
  });
  test('positive longitude wrapping - 721 degrees', function (t) {
    var norm = wrap(0, 721);
    t.equal(norm.lat, 0);
    t.equal(norm.lon, 1);
    t.end();
  });
};

module.exports.tests.longitude_negative = function(test, common) {
  test('negative longitude wrapping - 1 degree', function (t) {
    var norm = wrap(0, -1);
    t.equal(norm.lat, 0);
    t.equal(norm.lon, -1);
    t.end();
  });
  test('negative longitude wrapping - 181 degrees', function (t) {
    var norm = wrap(0, -181);
    t.equal(norm.lat, 0);
    t.equal(norm.lon, 179);
    t.end();
  });
  test('negative longitude wrapping - 271 degrees', function (t) {
    var norm = wrap(0, -271);
    t.equal(norm.lat, 0);
    t.equal(norm.lon, 89);
    t.end();
  });
  test('negative longitude wrapping - 361 degrees', function (t) {
    var norm = wrap(0, -361);
    t.equal(norm.lat, 0);
    t.equal(norm.lon, -1);
    t.end();
  });
  test('negative longitude wrapping - 631 degrees', function (t) {
    var norm = wrap(0, -631);
    t.equal(norm.lat, 0);
    t.equal(norm.lon, 89);
    t.end();
  });
  test('negative longitude wrapping - 721 degrees', function (t) {
    var norm = wrap(0, -721);
    t.equal(norm.lat, 0);
    t.equal(norm.lon, -1);
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
