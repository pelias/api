const sanitizer = require('../../../sanitizer/_text')();
const unicode = require('../../../helper/unicode');

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

  test('should truncate very long text inputs', (t) => {
    const raw = { text: `
Sometimes we make the process more complicated than we need to.
We will never make a journey of a thousand miles by fretting about 
how long it will take or how hard it will be.
We make the journey by taking each day step by step and then repeating 
it again and again until we reach our destination.` };
    const clean = {};
    const messages = sanitizer.sanitize(raw, clean);

    t.equals(clean.text.length, 140);
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [`param 'text' truncated to 140 characters`]);
    t.end();
  });

  test('strips emoji', (t) => {
    const raw = { text: 'abc' + '👩‍❤️‍👩'.repeat(200) };
    const clean = {};
    const messages = sanitizer.sanitize(raw, clean);

    t.equals(clean.text, 'abc');
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, []);
    t.end();
  });

  test('truncate should be unicode aware', (t) => {
    const grapheme = '\uD842\uDFB7';
    const raw = { text: grapheme.repeat(200) };
    const clean = {};
    const messages = sanitizer.sanitize(raw, clean);

    // sanity: fixture genuinely distinguishes code units from graphemes
    t.equals(grapheme.length, 2, 'fixture is a surrogate pair (2 code units)');
    t.equals([...grapheme].length, 1, 'fixture is one code point');
    t.equals(grapheme.normalize('NFC'), grapheme, 'fixture is NFC-stable');

    // truncated text is 140 graphemes (user-perceived characters),
    t.equals(clean.text, grapheme.repeat(140), 'truncated correctly');

    // text.length on the truncated result is 280 (140 × 2 code units),
    t.equals(clean.text.length, 280, 'truncated string is 280 UTF-16 code units');

    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [`param 'text' truncated to 140 characters`]);
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
