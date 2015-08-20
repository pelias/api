var sanitise  = require('../../../sanitiser/_alpha3');

module.exports.tests = {};

module.exports.tests.no_alpha3 = function(test, common) {
  test('empty request passed through unchanged', function(t) {
    var input = { query: { input: 'some search string'}, clean: {}};
    var result = sanitise(input);
    t.equal(result.error, false, 'no error expected');
    t.deepEquals({ query: { input: 'some search string'}, clean: {}}, input, 'input is unmodified');
    t.end();
  });
};

// invalid alpha3 (integer) fails
module.exports.tests.invalid_alpha3 = function(test, common) {
  test('invalid alpha3 raises error', function(t) {
    var input = { query: { alpha3: 5 }};
    var result = sanitise(input);
    t.equal(result.error, true, 'error expected');
    t.end();
  });
};

// invalid alpha3 (long string) fails
module.exports.tests.invalid_alpha3 = function(test, common) {
  test('invalid alpha3 raises error', function(t) {
    var input = { query: { alpha3: 'toolong' }};
    var result = sanitise(input);
    t.equal(result.error, true, 'error expected');
    t.end();
  });
};

// invalid alpha3 (short string) fail
module.exports.tests.invalid_alpha3 = function(test, common) {
  test('invalid alpha3 raises error', function(t) {
    var input = { query: { alpha3: 'sh' }}; // too short
    var result = sanitise(input);
    t.equal(result.error, true, 'error expected');
    t.end();
  });
};

module.exports.tests.valid_alpha3 = function(test, common) {
  test('invalid alpha3 raises error', function(t) {
    var input = { query: { alpha3: 'HKG' }};
    var result = sanitise(input);
    t.equal(result.error, false, 'no error expected');
    t.equal(input.clean.alpha3, 'HKG', 'clean alpha3 should be as expected');
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('SANTIZE alpha3 ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
