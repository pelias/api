var sanitizer = require('../../../sanitizer/_size');

module.exports.tests = {};

module.exports.tests.sanitize_size = function(test, common) {
  test('size=0', function(t) {
    var raw = { size: 0 };
    var clean = {};
    var res = sanitizer(/*defaults*/).sanitize(raw, clean);
    t.equal(res.errors.length, 0, 'should return no errors');
    t.equal(res.warnings.length, 1, 'should return warning');
    t.equal(res.warnings[0], 'out-of-range integer \'size\', using MIN_SIZE', 'check warning text');
    t.equal(clean.size, 1, 'default to 1');
    t.end();
  });

  test('size=10000', function(t) {
    var raw = { size: 10000 };
    var clean = {};
    var res = sanitizer(/*defaults*/).sanitize(raw, clean);
    t.equal(res.errors.length, 0, 'should return no errors');
    t.equal(res.warnings.length, 1, 'should return warning');
    t.equal(res.warnings[0], 'out-of-range integer \'size\', using MAX_SIZE', 'check warning text');
    t.equal(clean.size, 40, 'default to 40');
    t.end();
  });

  test('size not set', function(t) {
    var raw = {};
    var clean = {};
    var res = sanitizer(/*defaults*/).sanitize(raw, clean);
    t.equal(res.errors.length, 0, 'should return no errors');
    t.equal(res.warnings.length, 0, 'should return no warning');
    t.equal(clean.size, 10, 'default to 10');
    t.end();
  });

  test('return an array of expected parameters in object form for validation', function(t) {
    const expected = [{ name: 'size' }];
    const validParameters = sanitizer(/*defaults*/).expected();
    t.deepEquals(validParameters, expected);
    t.end();
  });

  var valid_sizes = [5, '5', 5.5, '5.5'];
  valid_sizes.forEach(function (size) {
    test('size=' + size, function (t) {
      var raw = {size: size};
      var clean = {};
      var res = sanitizer(/*defaults*/).sanitize(raw, clean);
      t.equal(res.errors.length, 0, 'should return no errors');
      t.equal(res.warnings.length, 0, 'should return warning');
      t.equal(clean.size, 5, 'set to correct integer');
      t.end();
    });
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('SANITIZE _size ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
