var sanitizer = require('../../../sanitizer/_synthesize_analysis');
var _ = require('lodash');

module.exports.tests = {};

module.exports.tests.text_parser = function(test, common) {
  test('all variables should be parsed', function(t) {
    var raw = {
      query: ' \t query \t value \t ',
      address: ' \t address \t value \t ',
      neighbourhood: ' \t neighbourhood \t value \t ',
      borough: ' \t borough \t value \t ',
      city: ' \t city \t value \t ',
      county: ' \t county \t value \t ',
      state: ' \t state \t value \t ',
      postalcode: ' \t postalcode \t value \t ',
      country: ' \t country \t value \t '
    };

    var clean = {};

    var expected_clean = {
      parsed_text: {
        query: 'query value',
        address: 'address value',
        neighbourhood: 'neighbourhood value',
        borough: 'borough value',
        city: 'city value',
        county: 'county value',
        state: 'state value',
        postalcode: 'postalcode value',
        country: 'country value'
      }
    };

    var messages = sanitizer(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');
    t.end();

  });

  test('non-string and blank string values should be treated as not supplied', function(t) {
    // helper to return a random value that's considered invalid
    function getInvalidValue() {
      return _.sample([{}, [], false, '', ' \t ', 17, undefined]);
    }

    var raw = {
      query: getInvalidValue(),
      address: getInvalidValue(),
      neighbourhood: getInvalidValue(),
      borough: getInvalidValue(),
      city: getInvalidValue(),
      county: getInvalidValue(),
      state: getInvalidValue(),
      postalcode: getInvalidValue(),
      country: getInvalidValue()
    };

    var clean = {};

    var expected_clean = {
      parsed_text: {}
    };

    var messages = sanitizer(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEquals(messages.errors, ['at least one of the following fields is required: ' +
      'query, address, neighbourhood, borough, city, county, state, postalcode, country'], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');
    t.end();

  });

  test('no supplied fields should return error', function(t) {
    var raw = {};

    var clean = {};

    var expected_clean = { parsed_text: {} };

    var messages = sanitizer(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEquals(messages.errors, ['at least one of the following fields is required: ' +
      'query, address, neighbourhood, borough, city, county, state, postalcode, country'], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');
    t.end();

  });

};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('sanitizer _synthesize_analysis: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
