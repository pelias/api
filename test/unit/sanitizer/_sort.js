var sanitizer = require('../../../sanitizer/_sort');

module.exports.tests = {};

module.exports.tests.sanitize_sort = function(test, common) {
  test('sort=foo', function(t) {
    var raw = { sort: 'foo' };
    var clean = {};
    var res = sanitizer().sanitize(raw, clean);
    t.equal(res.errors.length, 0, 'should return no errors');
    t.equal(res.warnings.length, 1, 'should return warning');
    t.equal(res.warnings[0], 'invalid \'sort\', using \'distance\'');
    t.equal(clean.sort, 'distance', 'default to distance');
    t.end();
  });

  test('sort not set', function(t) {
    var raw = {};
    var clean = {};
    var res = sanitizer().sanitize(raw, clean);
    t.equal(res.errors.length, 0, 'should return no errors');
    t.equal(res.warnings.length, 0, 'should return no warning');
    t.equal(clean.sort, 'distance', 'default to distance');
    t.end();
  });

  test('return an array of expected parameters in object form for validation', function(t) {
    const expected = [{ name: 'sort' }];
    const validParameters = sanitizer().expected();
    t.deepEquals(validParameters, expected);
    t.end();
  });

  var valid_sorts = ['popularity', 'distance'];
  valid_sorts.forEach(function (sort) {
    test('sort=' + sort, function (t) {
      var raw = {sort: sort};
      var clean = {};
      var res = sanitizer().sanitize(raw, clean);
      t.equal(res.errors.length, 0, 'should return no errors');
      t.equal(res.warnings.length, 0, 'should return warning');
      t.equal(clean.sort, sort, 'set to correct value');
      t.end();
    });
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('SANITIZE _sort ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
