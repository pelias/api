const _ = require('lodash');
const sanitizer = require('../../../sanitizer/_city_name_standardizer')();

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

  test('undefined parsed_text.city should be unchanged', function(t) {
    const raw = {};

    const clean = {
      parsed_text: {
        address: 'address value',
        city: undefined
      }
    };

    const expected_clean = {
      parsed_text: {
        address: 'address value',
        city: undefined
      }
    };

    const messages = sanitizer.sanitize(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');
    t.end();

  });

  test('\'st\' should be expanded to \'saint\' wherever it appears in the city', function(t) {
    const raw = {};

    const clean = {
      parsed_text: {
        query: 'saint query value',
        neighbourhood: 'saint neighbourhood value',
        borough: 'saint borough value',
        city: 'st city ST value St',
        county: 'saint county value',
        state: 'saint state value',
        postalcode: 'saint postalcode value',
        country: 'saint country value'
      }
    };

    const expected_clean = {
      parsed_text: {
        query: 'saint query value',
        neighbourhood: 'saint neighbourhood value',
        borough: 'saint borough value',
        city: 'saint city saint value saint',
        county: 'saint county value',
        state: 'saint state value',
        postalcode: 'saint postalcode value',
        country: 'saint country value'
      }
    };

    const messages = sanitizer.sanitize(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');
    t.end();

  });

  test('\'ste\' should be expanded to \'sainte\' wherever it appears in the city', function(t) {
    const raw = {};

    const clean = {
      parsed_text: {
        query: 'sainte query value',
        neighbourhood: 'sainte neighbourhood value',
        borough: 'sainte borough value',
        city: 'ste city STE value StE',
        county: 'sainte county value',
        state: 'sainte state value',
        postalcode: 'sainte postalcode value',
        country: 'sainte country value'
      }
    };

    const expected_clean = {
      parsed_text: {
        query: 'sainte query value',
        neighbourhood: 'sainte neighbourhood value',
        borough: 'sainte borough value',
        city: 'sainte city sainte value sainte',
        county: 'sainte county value',
        state: 'sainte state value',
        postalcode: 'sainte postalcode value',
        country: 'sainte country value'
      }
    };

    const messages = sanitizer.sanitize(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');
    t.end();

  });

  test('\'ft\' should be expanded to \'fort\' wherever it appears in the city', function(t) {
    const raw = {};

    const clean = {
      parsed_text: {
        query: 'ft query value',
        neighbourhood: 'ft neighbourhood value',
        borough: 'ft borough value',
        city: 'Ft city ft value fT',
        county: 'ft county value',
        state: 'ft state value',
        postalcode: 'ft postalcode value',
        country: 'ft country value'
      }
    };

    const expected_clean = {
      parsed_text: {
        query: 'ft query value',
        neighbourhood: 'ft neighbourhood value',
        borough: 'ft borough value',
        city: 'fort city fort value fort',
        county: 'ft county value',
        state: 'ft state value',
        postalcode: 'ft postalcode value',
        country: 'ft country value'
      }
    };

    const messages = sanitizer.sanitize(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');
    t.end();

  });

  test('\'mt\' should be expanded to \'mount\' wherever it appears in the city', function(t) {
    const raw = {};

    const clean = {
      parsed_text: {
        query: 'mt query value',
        neighbourhood: 'mt neighbourhood value',
        borough: 'mt borough value',
        city: 'Mt city mt value mT',
        county: 'mt county value',
        state: 'mt state value',
        postalcode: 'mt postalcode value',
        country: 'mt country value'
      }
    };

    const expected_clean = {
      parsed_text: {
        query: 'mt query value',
        neighbourhood: 'mt neighbourhood value',
        borough: 'mt borough value',
        city: 'mount city mount value mount',
        county: 'mt county value',
        state: 'mt state value',
        postalcode: 'mt postalcode value',
        country: 'mt country value'
      }
    };

    const messages = sanitizer.sanitize(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');
    t.end();

  });

  test('mixture of \'mt\', \'ft\', \'st\', and \'st\' should be expanded', function(t) {
    const raw = {};

    const clean = {
      parsed_text: {
        city: 'mt. ft st ste mt ft.'
      }
    };

    const expected_clean = {
      parsed_text: {
        city: 'mount fort saint sainte mount fort'
      }
    };

    const messages = sanitizer.sanitize(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');
    t.end();

  });

  test('period word boundary on \'mt.\' should replace with a space', function(t) {
    const raw = {};

    const clean = {
      parsed_text: {
        city: 'mt.city'
      }
    };

    const expected_clean = {
      parsed_text: {
        city: 'mount city'
      }
    };

    const messages = sanitizer.sanitize(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');
    t.end();

  });

  test('period word boundary on \'ft.\' should replace with a space', function(t) {
    const raw = {};

    const clean = {
      parsed_text: {
        city: 'ft.city'
      }
    };

    const expected_clean = {
      parsed_text: {
        city: 'fort city'
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
    return tape('sanitizer _city_name_standardizer: ' + name, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
