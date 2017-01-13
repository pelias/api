const _ = require('lodash');
const proxyquire =  require('proxyquire').noCallThru();

module.exports.tests = {};

module.exports.tests.text_parser = function(test, common) {
  test('all variables should be parsed', function(t) {
    var sanitizer = proxyquire('../../../sanitizer/_synthesize_analysis', {
      'pelias-text-analyzer': { parse: function(query) {
        t.fail('parse should not have been called');
      }
    }});

    const raw = {
      venue: ' \t venue \t value \t ',
      neighbourhood: ' \t neighbourhood \t value \t ',
      borough: ' \t borough \t value \t ',
      locality: ' \t locality \t value \t ',
      county: ' \t county \t value \t ',
      region: ' \t region \t value \t ',
      postalcode: ' \t postalcode \t value \t ',
      country: ' \t country \t value \t '
    };

    const clean = {};

    const expected_clean = {
      parsed_text: {
        query: 'venue value',
        neighbourhood: 'neighbourhood value',
        borough: 'borough value',
        city: 'locality value',
        county: 'county value',
        state: 'region value',
        postalcode: 'postalcode value',
        country: 'country value'
      }
    };

    const messages = sanitizer(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');
    t.end();

  });

  test('non-string and blank string values should be treated as not supplied', function(t) {
    var sanitizer = proxyquire('../../../sanitizer/_synthesize_analysis', {
      'pelias-text-analyzer': { parse: function(query) {
        t.fail('parse should not have been called');
      }
    }});

    // helper to return a random value that's considered invalid
    function getInvalidValue() {
      return _.sample([{}, [], false, '', ' \t ', 17, undefined]);
    }

    const raw = {
      venue: getInvalidValue(),
      address: getInvalidValue(),
      neighbourhood: getInvalidValue(),
      borough: getInvalidValue(),
      locality: getInvalidValue(),
      county: getInvalidValue(),
      region: getInvalidValue(),
      postalcode: getInvalidValue(),
      country: getInvalidValue()
    };

    const clean = {};

    const expected_clean = {
      parsed_text: {}
    };

    const messages = sanitizer(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEquals(messages.errors, ['at least one of the following fields is required: ' +
      'venue, address, neighbourhood, borough, locality, county, region, postalcode, country'], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');
    t.end();

  });

  test('no supplied fields should return error', function(t) {
    var sanitizer = proxyquire('../../../sanitizer/_synthesize_analysis', {
      'pelias-text-analyzer': { parse: function(query) {
        t.fail('parse should not have been called');
      }
    }});

    const raw = {};

    const clean = {};

    const expected_clean = { parsed_text: {} };

    const messages = sanitizer(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEquals(messages.errors, ['at least one of the following fields is required: ' +
      'venue, address, neighbourhood, borough, locality, county, region, postalcode, country'], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');
    t.end();

  });

  test('postalcode-only parsed_text should return error', function(t) {
    var sanitizer = proxyquire('../../../sanitizer/_synthesize_analysis', {
      'pelias-text-analyzer': { parse: function(query) {
        t.fail('parse should not have been called');
      }
    }});

    const raw = {
      postalcode: 'postalcode value'
    };

    const clean = {};

    const expected_clean = {
      parsed_text: {
        postalcode: 'postalcode value'
      }
    };

    const messages = sanitizer(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEquals(messages.errors, ['postalcode-only inputs are not supported'], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');
    t.end();

  });

  test('text_analyzer identifying house number should extract it and street', function(t) {
    var sanitizer = proxyquire('../../../sanitizer/_synthesize_analysis', {
      'pelias-text-analyzer': { parse: function(query) {
        t.equals(query, 'Number Value Street Value Number Value');

        return {
          number: 'Number Value'
        };
      }
    }});

    const raw = {
      address: 'Number Value Street Value Number Value'
    };

    const clean = {};

    const expected_clean = {
      parsed_text: {
        number: 'Number Value',
        street: 'Street Value Number Value'
      }
    };

    const messages = sanitizer(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');
    t.end();

  });

  test('text_analyzer identifying postalcode but not house number should assign to number and remove from address', function(t) {
    var sanitizer = proxyquire('../../../sanitizer/_synthesize_analysis', {
      'pelias-text-analyzer': { parse: function(query) {
        t.equals(query, 'Number Value Street Value Number Value');

        return {
          postalcode: 'Number Value'
        };
      }
    }});

    const raw = {
      address: 'Number Value Street Value Number Value'
    };

    const clean = {};

    const expected_clean = {
      parsed_text: {
        number: 'Number Value',
        street: 'Street Value Number Value'
      }
    };

    const messages = sanitizer(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');
    t.end();

  });

  test('text_analyzer not revealing possible number should move address to street', function(t) {
    var sanitizer = proxyquire('../../../sanitizer/_synthesize_analysis', {
      'pelias-text-analyzer': { parse: function(query) {
        t.equals(query, 'Street Value');

        return {};
      }
    }});

    const raw = {
      address: 'Street Value'
    };

    const clean = {};

    const expected_clean = {
      parsed_text: {
        street: 'Street Value'
      }
    };

    const messages = sanitizer(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');
    t.end();

  });

};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('sanitizer _synthesize_analysis: ' + name, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
