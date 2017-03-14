var sanitize = require('../../../sanitizer/_debug');

module.exports.tests = {};

module.exports.tests.sanitize_force_libpostal = function(test, common) {

  test('force_libpostal(default)', function(t) {
    const raw = {};
    const clean = {};
    sanitize(raw, clean);
    t.equal(clean.force_libpostal, false, 'defaults to false');
    t.end();
  });
  
  var valid_values = ['true', true, 1, '1', 'yes', 'y'];
  valid_values.forEach(function(value) {
    test('force_libpostal(true) ' + value, function(t) {
      const raw = {
        'debug:force_libpostal': value
      };
      const clean = {};
      sanitize(raw, clean);
      t.equal(clean.force_libpostal, true, 'set to true');
      t.end();
    });
  });

  var valid_false_values = ['false', false, 0, '0', 'no', 'n', null, -1, 123, NaN, 'abc'];
  valid_false_values.forEach(function(value) {
    test('force_libpostal(false) ' + value, function(t) {
      const raw = {
        'debug:force_libpostal': value
      };
      const clean = {};
      sanitize(raw, clean);
      t.equal(clean.force_libpostal, false, 'set to false');
      t.end();
    });
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('SANTIZE _debug ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
