const sanitizer = require('../../../sanitizer/_text')();

module.exports.tests = {};

module.exports.tests.text_parser = function(test, common) {
  test('non-empty raw.text should overwrite clean.text', t => {
    const raw = {
      text: 'raw input'
    };
    const clean = {
      text: 'original clean.text'
    };

    const expected_clean = {
      text: raw.text
    };

    const messages = sanitizer.sanitize(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEquals(messages, { warnings: [], errors: [] }, 'no errors/warnings');
    t.end();

  });

  test('undefined/empty raw.text should add error message', t => {
    [undefined, ''].forEach(val => {
      const raw = {
        text: val
      };
      const clean = {
      };

      const expected_clean = {
      };

      const messages = sanitizer.sanitize(raw, clean);

      t.deepEquals(clean, expected_clean);
      t.deepEquals(messages.errors, ['invalid param \'text\': text length, must be >0']);
      t.deepEquals(messages.warnings, [], 'no warnings');

    });

    t.end();

  });

  test('should trim whitespace', t => {
    var clean = {};
    var raw = { text: ` test \n ` };
    const messages = sanitizer.sanitize(raw, clean);

    t.equals(clean.text, 'test');
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');

    t.end();
  });

  test('should trim double quotes', t => {
    var clean = {};
    var raw = { text: ` "test" \n ` };
    const messages = sanitizer.sanitize(raw, clean);

    t.equals(clean.text, 'test');
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');

    t.end();
  });

  test('should trim single quotes', t => {
    var clean = {};
    var raw = { text: ` 'test' \n ` };
    const messages = sanitizer.sanitize(raw, clean);

    t.equals(clean.text, 'test');
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');

    t.end();
  });

  test('should trim German quotes', t => {
    var clean = {};
    var raw = { text: ` „test“ \n ` };
    const messages = sanitizer.sanitize(raw, clean);

    t.equals(clean.text, 'test');
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');

    t.end();
  });

  test('should trim guillemets', t => {
    var clean = {};
    var raw = { text: ` »test« \n ` };
    const messages = sanitizer.sanitize(raw, clean);

    t.equals(clean.text, 'test');
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');

    t.end();
  });

  test('should trim Chinese quotes', t => {
    var clean = {};
    var raw = { text: ` ﹁「test」﹂ \n ` };
    const messages = sanitizer.sanitize(raw, clean);

    t.equals(clean.text, 'test');
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');

    t.end();
  });

  test('return an array of expected parameters in object form for validation', (t) => {
    const expected = [{ name: 'text' }];
    const validParameters = sanitizer.expected();
    t.deepEquals(validParameters, expected);
    t.end();
  });

  test('whitespace-only input counts as empty', (t) => {
    const raw = { text: ' ' };
    const clean = {};

    const expected_clean = {};

    const messages = sanitizer.sanitize(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEquals(messages.errors, ['invalid param \'text\': text length, must be >0']);
    t.deepEquals(messages.warnings, [], 'no warnings');
    t.end();
  });
};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`sanitizer _text: ${name}`, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
