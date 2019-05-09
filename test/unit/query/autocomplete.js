const proxyquire = require('proxyquire').noCallThru();
const realPeliasConfig = require('pelias-config');
const defaultPeliasConfig = {
  generate: function() {
    return realPeliasConfig.generateDefaults();
  }
};

var generate = proxyquire('../../../query/autocomplete', {
  'pelias-config': defaultPeliasConfig
});

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
      text: 'test',
      tokens: ['test'],
      tokens_complete: [],
      tokens_incomplete: ['test']
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/autocomplete_linguistic_only');

    t.deepEqual(compiled.type, 'autocomplete', 'query type set');
    t.deepEqual(compiled.body, expected, 'autocomplete_linguistic_only');
    t.end();
  });

  test('valid lingustic autocomplete with 3 tokens', function(t) {
    var query = generate({
      text: 'one two three',
      tokens: ['one','two','three'],
      tokens_complete: ['one','two'],
      tokens_incomplete: ['three']
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/autocomplete_linguistic_multiple_tokens');

    t.deepEqual(compiled.type, 'autocomplete', 'query type set');
    t.deepEqual(compiled.body, expected, 'autocomplete_linguistic_multiple_tokens');
    t.end();
  });

  test('valid lingustic autocomplete with comma delimited admin section', function(t) {
    var query = generate({
      text: 'one two, three',
      parsed_text: {
        name: 'one two',
        regions: [ 'one two', 'three' ],
        admin_parts: 'three'
      },
      tokens: ['one','two'],
      tokens_complete: ['one','two'],
      tokens_incomplete: []
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/autocomplete_linguistic_with_admin');

    t.deepEqual(compiled.type, 'autocomplete', 'query type set');
    t.deepEqual(compiled.body, expected, 'autocomplete_linguistic_with_admin');
    t.end();
  });

  // if the final token is less than 2 chars we need to remove it from the string.
  // note: this behaviour is tied to having a min_gram size of 2.
  // note: if 1 grams are enabled at a later date, remove this behaviour.
  test('valid lingustic autocomplete final token', function(t) {
    var query = generate({
      text: 'one t',
      tokens: ['one','t'],
      tokens_complete: ['one'],
      tokens_incomplete: []
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/autocomplete_linguistic_final_token');

    t.deepEqual(compiled.type, 'autocomplete', 'query type set');
    t.deepEqual(compiled.body, expected, 'autocomplete_linguistic_final_token');
    t.end();
  });


  /*
   * Custom pelias.json settings used by the next 3 tests
   */
  const customConfig = {
    api: {
      autocomplete: {
        exclude_address_length: 2
      }
    }
  };

  const configWithCustomSettings = {
    generate: function() {
      return realPeliasConfig.generateCustom(customConfig);
    }
  };

  const generate_custom = proxyquire('../../../query/autocomplete', {
    'pelias-config': configWithCustomSettings
  });

  test('valid lingustic autocomplete one character token', function(t) {
    var query = generate_custom({
      text: 't',
      tokens: ['t'],
      tokens_complete: [],
      tokens_incomplete: ['t']
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/autocomplete_linguistic_one_char_token');

    t.deepEqual(compiled.type, 'autocomplete', 'query type set');
    t.deepEqual(compiled.body, expected, 'autocomplete_linguistic_one_char_token');
    t.end();
  });

  test('valid lingustic autocomplete two character token', function(t) {
    console.log(`config value: ${configWithCustomSettings.generate().get('api.autocomplete.exclude_address_length')}`);
    var query = generate_custom({
      text: 'te',
      tokens: ['te'],
      tokens_complete: [],
      tokens_incomplete: ['te']
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/autocomplete_linguistic_two_char_token');

    t.deepEqual(compiled.type, 'autocomplete', 'query type set');
    t.deepEqual(compiled.body, expected, 'autocomplete_linguistic_two_char_token');
    t.end();
  });

  test('valid lingustic autocomplete three character token', function(t) {
    var query = generate_custom({
      text: 'tes',
      tokens: ['tes'],
      tokens_complete: [],
      tokens_incomplete: ['tes']
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/autocomplete_linguistic_three_char_token');

    t.deepEqual(compiled.type, 'autocomplete', 'query type set');
    t.deepEqual(compiled.body, expected, 'autocomplete_linguistic_three_char_token');
    t.end();
  });

  // end tests with custom pelias.json settings

  test('autocomplete + focus', function(t) {
    var query = generate({
      text: 'test',
      'focus.point.lat': 29.49136,
      'focus.point.lon': -82.50622,
      tokens: ['test'],
      tokens_complete: [],
      tokens_incomplete: ['test']
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/autocomplete_linguistic_focus');

    t.deepEqual(compiled.type, 'autocomplete', 'query type set');
    t.deepEqual(compiled.body, expected, 'autocomplete_linguistic_focus');
    t.end();
  });

  test('autocomplete + focus on null island', function(t) {
    var query = generate({
      text: 'test',
      'focus.point.lat': 0,
      'focus.point.lon': 0,
      tokens: ['test'],
      tokens_complete: [],
      tokens_incomplete: ['test']
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/autocomplete_linguistic_focus_null_island');

    t.deepEqual(compiled.type, 'autocomplete', 'query type set');
    t.deepEqual(compiled.body, expected, 'autocomplete_linguistic_focus_null_island');
    t.end();
  });

  test('valid sources filter', function(t) {
    var query = generate({
      'text': 'test',
      'sources': ['test_source'],
      tokens: ['test'],
      tokens_complete: [],
      tokens_incomplete: ['test']
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/autocomplete_with_source_filtering');

    t.deepEqual(compiled.type, 'autocomplete', 'query type set');
    t.deepEqual(compiled.body, expected, 'valid autocomplete query with source filtering');
    t.end();
  });

  test('valid layers filter', function(t) {
    var query = generate({
      'text': 'test',
      'layers': ['country'],
      tokens: ['test'],
      tokens_complete: [],
      tokens_incomplete: ['test']
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/autocomplete_with_layer_filtering');

    t.deepEqual(compiled.type, 'autocomplete', 'query type set');
    t.deepEqual(compiled.body, expected, 'valid autocomplete query with layer filtering');
    t.end();
  });

  test('valid categories filter', function (t) {
    var clean = {
      text: 'test',
      tokens: ['test'],
      tokens_complete: [],
      tokens_incomplete: ['test'],
      categories: ['retail', 'food']
    };

    var query = generate(clean);

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/autocomplete_with_category_filtering');

    t.deepEqual(compiled.type, 'autocomplete', 'query type set');
    t.deepEqual(compiled.body, expected, 'valid autocomplete query with category filtering');
    t.end();
  });

  test('single character street address', function(t) {
    var query = generate({
      text: 'k road, laird',
      parsed_text: {
        name: 'k road',
        street: 'k road',
        regions: [ 'laird' ]
      },
      tokens: ['k', 'road'],
      tokens_complete: ['k', 'road'],
      tokens_incomplete: []
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/autocomplete_single_character_street');

    t.deepEqual(compiled.type, 'autocomplete', 'query type set');
    t.deepEqual(compiled.body, expected, 'autocomplete_single_character_street');
    t.end();
  });

  test('valid boundary.country search', function(t) {
    var query = generate({
      text: 'test',
      tokens: ['test'],
      tokens_complete: [],
      tokens_incomplete: ['test'],
      'boundary.country': ['ABC']
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/autocomplete_boundary_country');

    t.deepEqual(compiled.type, 'autocomplete', 'query type set');
    t.deepEqual(compiled.body, expected, 'autocomplete: valid boundary.country query');
    t.end();
  });

  test('autocomplete + bbox around San Francisco', function(t) {
    var query = generate({
      text: 'test',
      'boundary.rect.max_lat': 37.83239,
      'boundary.rect.max_lon': -122.35698,
      'boundary.rect.min_lat': 37.70808,
      'boundary.rect.min_lon': -122.51489,
      tokens: ['test'],
      tokens_complete: [],
      tokens_incomplete: ['test']
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/autocomplete_linguistic_bbox_san_francisco');

    t.deepEqual(compiled.type, 'autocomplete', 'query type set');
    t.deepEqual(compiled.body, expected, 'autocomplete_linguistic_bbox_san_francisco');
    t.end();
  });

  test('autocomplete + circle around San Francisco', function(t) {
    var query = generate({
      text: 'test',
      'boundary.circle.lat': 37.83239,
      'boundary.circle.lon': -122.35698,
      'boundary.circle.radius': 20,
      tokens: ['test'],
      tokens_complete: [],
      tokens_incomplete: ['test']
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/autocomplete_linguistic_circle_san_francisco');

    t.deepEqual(compiled.type, 'autocomplete', 'query type set');
    t.deepEqual(compiled.body, expected, 'autocomplete_linguistic_circle_san_francisco');
    t.end();
  });

  test('valid boundary.gid search', function(t) {
    var query = generate({
      text: 'test',
      tokens: ['test'],
      tokens_complete: [],
      tokens_incomplete: ['test'],
      'boundary.gid': '123'
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/autocomplete_boundary_gid');

    t.deepEqual(compiled.type, 'autocomplete', 'query type set');
    t.deepEqual(compiled.body, expected, 'autocomplete: valid boundary.gid query');
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
