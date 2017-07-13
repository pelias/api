const sanitizer = require('../../../sanitizer/_text');

module.exports.tests = {};

module.exports.tests.text_parser = function(test, common) {
  test('non-empty raw.text should call analyzer and set clean.text and not clean.parsed_text', t => {
    const raw = {
      text: 'raw input'
    };
    const clean = {
      text: 'original clean.text'
    };

    const expected_clean = {
      text: raw.text
    };

    const messages = sanitizer(raw, clean);

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

      const messages = sanitizer(raw, clean);

      t.deepEquals(clean, expected_clean);
      t.deepEquals(messages.errors, ['invalid param \'text\': text length, must be >0'], 'no errors');
      t.deepEquals(messages.warnings, [], 'no warnings');

    });

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
