const sanitizer = require('../../../sanitizer/_debug')();

module.exports.tests = {};

module.exports.tests.sanitize_debug = function(test, common) {
  ['true', '1', 1, true, 'TRUE', 'TrUe'].forEach((value) => {
    test('debug flag is on', function(t) {
      const raw = { debug: value };
      const clean = {};
      const expected_clean = { enableDebug: true  };

      const messages = sanitizer.sanitize(raw, clean);

      t.deepEquals(clean, expected_clean);
      t.deepEqual(messages.errors, [], 'no error returned');
      t.deepEqual(messages.warnings, [], 'no warnings returned');
      t.end();
    });
  });

  ['false', false, '0', 0, 'value', {}].forEach((value) => {
    test('non-truthy values should set clean.debug to false', function(t) {
      const raw = { debug: value };
      const clean = {};
      const expected_clean = { enableDebug: false  };

      const messages = sanitizer.sanitize(raw, clean);

      t.deepEquals(clean, expected_clean);
      t.deepEqual(messages.errors, [], 'no error returned');
      t.deepEqual(messages.warnings, [], 'no warnings returned');
      t.end();
    });
  });

  test('undefined default flag should not set clean.debug', function(t) {
    const raw = {};
    const clean = {};
    const expected_clean = {};

    const messages = sanitizer.sanitize(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEqual(messages.errors, [], 'no error returned');
    t.deepEqual(messages.warnings, [], 'no warnings returned');
    t.end();
  });

  test('return an array of expected parameters in object form for validation', (t) => {
    const expected = [{ name: 'debug' }];
    const validParameters = sanitizer.expected();
    t.deepEquals(validParameters, expected);
    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('SANITIZE _debug ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
