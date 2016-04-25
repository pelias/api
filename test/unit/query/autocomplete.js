
var generate = require('../../../query/autocomplete');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof generate, 'function', 'valid function');
    t.end();
  });
};

module.exports.tests.query = function(test, common) {
  test('valid lingustic-only autocomplete', function(t) {
    var query = generate({
      text: 'test'
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/autocomplete_linguistic_only');

    t.deepEqual(compiled, expected, 'autocomplete_linguistic_only');
    t.end();
  });

  test('valid lingustic autocomplete with 3 tokens', function(t) {
    var query = generate({
      text: 'one two three'
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/autocomplete_linguistic_multiple_tokens');

    t.deepEqual(compiled, expected, 'autocomplete_linguistic_multiple_tokens');
    t.end();
  });

  test('valid lingustic autocomplete with comma delimited admin section', function(t) {
    var query = generate({
      text: 'one two, three',
      parsed_text: {
        name: 'one two',
        regions: [ 'one two', 'three' ],
        admin_parts: 'three'
      }
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/autocomplete_linguistic_with_admin');

    t.deepEqual(compiled, expected, 'autocomplete_linguistic_with_admin');
    t.end();
  });

  // if the final token is less than 2 chars we need to remove it from the string.
  // note: this behaviour is tied to having a min_gram size of 2.
  // note: if 1 grams are enabled at a later date, remove this behaviour.
  test('valid lingustic autocomplete final token', function(t) {
    var query = generate({
      text: 'one t'
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/autocomplete_linguistic_final_token');

    t.deepEqual(compiled, expected, 'autocomplete_linguistic_final_token');
    t.end();
  });

  test('autocomplete + focus', function(t) {
    var query = generate({
      text: 'test',
      'focus.point.lat': 29.49136,
      'focus.point.lon': -82.50622
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/autocomplete_linguistic_focus');

    t.deepEqual(compiled, expected, 'autocomplete_linguistic_focus');
    t.end();
  });

  test('autocomplete + focus on null island', function(t) {
    var query = generate({
      text: 'test',
      'focus.point.lat': 0,
      'focus.point.lon': 0
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/autocomplete_linguistic_focus_null_island');

    t.deepEqual(compiled, expected, 'autocomplete_linguistic_focus_null_island');
    t.end();
  });

  test('valid sources filter', function(t) {
    var query = generate({
      'text': 'test',
      'sources': ['test_source']
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/autocomplete_with_source_filtering');

    t.deepEqual(compiled, expected, 'valid autocomplete query with source filtering');
    t.end();
  });

  test('single character street address', function(t) {
    var query = generate({
      text: 'k road, laird',
      parsed_text: {
        name: 'k road',
        street: 'k road',
        regions: [ 'laird' ]
      }
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/autocomplete_single_character_street');

    t.deepEqual(compiled, expected, 'autocomplete_single_character_street');
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('autocomplete query ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
