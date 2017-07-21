const sanitizer = require('../../../sanitizer/_iso2_to_iso3')();

module.exports.tests = {};

module.exports.tests.text_parser = function(test, common) {
  test('clean without parsed_text should not throw exception', function(t) {
    const raw = {};

    const clean = {
    };

    const expected_clean = {
    };

    const messages = sanitizer.sanitize(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');
    t.end();

  });

  test('country with known iso2 should be converted to iso3', function(t) {
    const raw = {};

    const clean = {
      parsed_text: {
        address: 'address value',
        country: 'tH'
      }
    };

    const expected_clean = {
      parsed_text: {
        address: 'address value',
        country: 'THA'
      }
    };

    const messages = sanitizer.sanitize(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');
    t.end();

  });

  test('country with unknown iso2 should be unchanged', function(t) {
    const raw = {};

    const clean = {
      parsed_text: {
        address: 'address value',
        country: 'TB'
      }
    };

    const expected_clean = {
      parsed_text: {
        address: 'address value',
        country: 'TB'
      }
    };

    const messages = sanitizer.sanitize(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');
    t.end();

  });

  test('undefined country should be unchanged', function(t) {
    const raw = {};

    const clean = {
      parsed_text: {
        address: 'address value',
        country: undefined
      }
    };

    const expected_clean = {
      parsed_text: {
        address: 'address value',
        country: undefined
      }
    };

    const messages = sanitizer.sanitize(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');
    t.end();

  });

};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('SANITIZE _iso2_to_iso3: ' + name, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
