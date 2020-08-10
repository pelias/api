const sanitizer = require('../../../sanitizer/_debug')();

module.exports.tests = {};

module.exports.tests.sanitize_debug = function(test, common) {
  ['true', '1', 1, true, 'TRUE', 'TrUe'].forEach((value) => {
    test(`debug flag is on: ${value}`, function(t) {
      const raw = { debug: value };
      const clean = {};
      const expected_clean = { enableDebug: true, exposeInternalDebugTools: false };

      const messages = sanitizer.sanitize(raw, clean);

      t.deepEquals(clean, expected_clean);
      t.deepEqual(messages.errors, [], 'no error returned');
      t.deepEqual(messages.warnings, [], 'no warnings returned');
      t.end();
    });
  });

  ['2', 2, 'elastic'].forEach((value) => {
    test(`debug flag is on: ${value} and exposeInternalDebugTools=true`, function(t) {
      const internalSanitizer = require('../../../sanitizer/_debug')(true);
      const raw = { debug: value };
      const clean = {};
      const expected_clean = { enableDebug: true, enableElasticDebug: true, exposeInternalDebugTools: true };

      const messages = internalSanitizer.sanitize(raw, clean);

      t.deepEquals(clean, expected_clean);
      t.deepEqual(messages.errors, [], 'no error returned');
      t.deepEqual(messages.warnings, [], 'no warnings returned');
      t.end();
    });

    test(`debug flag is on: ${value} and exposeInternalDebugTools unset`, function(t) {
      const raw = { debug: value };
      const clean = {};
      const expected_clean = { enableDebug: false, exposeInternalDebugTools: false };

      const messages = sanitizer.sanitize(raw, clean);

      t.deepEquals(clean, expected_clean);
      t.deepEqual(messages.errors, [`Debug level not enabled: ${value}`], 'no error returned');
      t.deepEqual(messages.warnings, [], 'no warnings returned');
      t.end();
    });
  });

  ['3', 3, 'explain'].forEach((value) => {
    test(`debug flag is on: ${value} and exposeInternalDebugTools=true`, function(t) {
      const internalSanitizer = require('../../../sanitizer/_debug')(true);
      const raw = { debug: value };
      const clean = {};
      const expected_clean = { enableDebug: true, enableElasticDebug: true, enableElasticExplain: true, exposeInternalDebugTools: true };

      const messages = internalSanitizer.sanitize(raw, clean);

      t.deepEquals(clean, expected_clean);
      t.deepEqual(messages.errors, [], 'no error returned');
      t.deepEqual(messages.warnings, [], 'no warnings returned');
      t.end();
    });

    test(`debug flag is on: ${value} and exposeInternalDebugTools unset`, function(t) {
      const raw = { debug: value };
      const clean = {};
      const expected_clean = { enableDebug: false, exposeInternalDebugTools: false };

      const messages = sanitizer.sanitize(raw, clean);

      t.deepEquals(clean, expected_clean);
      t.deepEqual(messages.errors, [`Debug level not enabled: ${value}`], 'no error returned');
      t.deepEqual(messages.warnings, [], 'no warnings returned');
      t.end();
    });
  });

  ['false', false, '0', 0, {}].forEach((value) => {
    test(`non-truthy values should set clean.debug to false: ${value}`, function(t) {
      const raw = { debug: value };
      const clean = {};
      const expected_clean = { enableDebug: false, exposeInternalDebugTools: false  };

      const messages = sanitizer.sanitize(raw, clean);

      t.deepEquals(clean, expected_clean);
      t.deepEqual(messages.errors, [], 'no error returned');
      t.deepEqual(messages.warnings, [], 'no warnings returned');
      t.end();
    });
  });

  test(`unknown value shold return error`, function(t) {
    const raw = { debug: 'value' };
    const clean = {};
    const expected_clean = { enableDebug: false, exposeInternalDebugTools: false  };

    const messages = sanitizer.sanitize(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEqual(messages.errors, ['Unknown debug value: value']);
    t.deepEqual(messages.warnings, [], 'no warnings returned');
    t.end();
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

  test(`setting restrictIds should error if exposeInternalDebugTools is off`, function(t) {
    const raw = { restrictIds: 'a:1,b:2', debug: '1' };
    const clean = {};
    const expected_clean = { enableDebug: true, exposeInternalDebugTools: false };

    const messages = sanitizer.sanitize(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEqual(messages.errors, ['restrictIds not enabled, must enable exposeInternalDebugTools in pelias config'], 'no error returned');
    t.deepEqual(messages.warnings, [], 'no warnings returned');
    t.end();
  });

  test(`setting restrictIds should work if exposeInternalDebugTools is on`, function(t) {
    const internalSanitizer = require('../../../sanitizer/_debug')(true);

    const raw = { restrictIds: 'a:1,b:2', debug: '1' };
    const clean = {};
    const expected_clean = { restrictIds: ['a:1', 'b:2'], exposeInternalDebugTools: true, enableDebug: true };

    const messages = internalSanitizer.sanitize(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEqual(messages.errors, [], 'no error returned');
    t.deepEqual(messages.warnings, [], 'no warnings returned');
    t.end();
  });

  test('return an array of expected parameters in object form for validation', (t) => {
    const expected = [{ name: 'debug' }, { name: 'restrictIds' }];
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
