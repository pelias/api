var generate = require('../../../query/search');
var fs = require('fs');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof generate, 'function', 'valid function');
    t.end();
  });
};

module.exports.tests.query = function(test, common) {
  test('valid fuzzy search + focus + bbox', function(t) {
    var clean = {
      parsed_text: {
        street: 'street value'
      },
      text: 'test',
      querySize: 10,
      'focus.point.lat': 29.49136, 'focus.point.lon': -82.50622,
      'boundary.rect.min_lat': 47.47,
      'boundary.rect.max_lon': -61.84,
      'boundary.rect.max_lat': 11.51,
      'boundary.rect.min_lon': -103.16,
      layers: ['test'],
      fuzziness: 2,
      max_expansions: 15
    };

    var query = generate(clean);

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_linguistic_focus_bbox_fuzzy');

    t.deepEqual(compiled.type, 'search_fallback', 'query type set');
    t.deepEqual(compiled.body, expected, 'search_linguistic_focus_bbox_fuzzy');
    t.end();
  });

  test('valid fuzzy search + bbox', function(t) {
    var clean = {
      parsed_text: {
        street: 'street value'
      },
      text: 'test',
      querySize: 10,
      'boundary.rect.min_lat': 47.47,
      'boundary.rect.max_lon': -61.84,
      'boundary.rect.max_lat': 11.51,
      'boundary.rect.min_lon': -103.16,
      layers: ['test'],
      fuzziness: 1,
      max_expansions: 20
    };

    var query = generate(clean);

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_linguistic_bbox_fuzzy');

    t.deepEqual(compiled.type, 'search_fallback', 'query type set');
    t.deepEqual(compiled.body, expected, 'search_linguistic_bbox_fuzzy');
    t.end();
  });

  test('valid fuzzy lingustic-only search', function(t) {
    var clean = {
      parsed_text: {
        street: 'street value'
      },
      text: 'test', querySize: 10,
      layers: ['test'],
      fuzziness: 1,
      max_expansions: 20
    };

    var query = generate(clean);

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_linguistic_only_fuzzy');

    t.deepEqual(compiled.type, 'search_fallback', 'query type set');
    t.deepEqual(compiled.body, expected, 'search_linguistic_only_fuzzy');
    t.end();
  });

  test('fuzzy search search + focus', function(t) {
    var clean = {
      parsed_text: {
        street: 'street value'
      },
      text: 'test', querySize: 10,
      'focus.point.lat': 29.49136, 'focus.point.lon': -82.50622,
      layers: ['test'],
      fuzziness: 1,
      max_expansions: 20
    };

    var query = generate(clean);

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_linguistic_focus_fuzzy');

    t.deepEqual(compiled.type, 'search_fallback', 'query type set');
    t.deepEqual(compiled.body, expected, 'search_linguistic_focus_fuzzy');
    t.end();
  });

  test('fuzzy search search + focus on null island', function(t) {
    var clean = {
      parsed_text: {
        street: 'street value'
      },
      text: 'test', querySize: 10,
      'focus.point.lat': 0, 'focus.point.lon': 0,
      layers: ['test'],
      fuzziness: 1,
      max_expansions: 20
    };

    var query = generate(clean);

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_linguistic_focus_null_island_fuzzy');

    t.deepEqual(compiled.type, 'search_fallback', 'query type set');
    t.deepEqual(compiled.body, expected, 'search_linguistic_focus_null_island_fuzzy');
    t.end();
  });

  test('parsed_text with all fields should use FallbackQuery, fuzzy on street', function(t) {
    var clean = {
      parsed_text: {
        query: 'query value',
        category: 'category value',
        housenumber: 'number value',
        street: 'street value',
        neighbourhood: 'neighbourhood value',
        borough: 'borough value',
        postalcode: 'postalcode value',
        city: 'city value',
        county: 'county value',
        state: 'state value',
        country: 'country value'
      },
      fuzziness: 1,
      max_expansions: 20
    };

    var query = generate(clean);

    var compiled = JSON.parse(JSON.stringify(query));
    var expected = require('../fixture/search_fallback_fuzzy');

    t.deepEqual(compiled.type, 'search_fallback', 'query type set');
    t.deepEqual(compiled.body, expected, 'fallbackQuery');
    t.end();

  });

  test('valid boundary.country fuzzy search', function(t) {
    var clean = {
      parsed_text: {
        street: 'street value'
      },
      text: 'test', querySize: 10,
      layers: ['test'],
      'boundary.country': ['ABC'],
      fuzziness: 1,
      max_expansions: 20
    };

    var query = generate(clean);

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_boundary_country_fuzzy');

    t.deepEqual(compiled.type, 'search_fallback', 'query type set');
    t.deepEqual(compiled.body, expected, 'search: valid boundary.country fuzzy query');
    t.end();
  });

  test('valid multi boundary.country search', function(t) {
    var clean = {
      parsed_text: {
        street: 'street value'
      },
      text: 'test', querySize: 10,
      layers: ['test'],
      'boundary.country': ['ABC', 'DEF'],
      fuzziness: 1,
      max_expansions: 20
    };

    var query = generate(clean);

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_boundary_country_multi_fuzzy');

    t.deepEqual(compiled.type, 'search_fallback', 'query type set');
    t.deepEqual(compiled.body, expected, 'search: valid multi boundary.country fuzzy query');
    t.end();
  });

  test('valid sources filter', function(t) {
    var clean = {
      parsed_text: {
        street: 'street value'
      },
      'text': 'test',
      'sources': ['test_source'],
      fuzziness: 1,
      max_expansions: 20
    };

    var query = generate(clean);

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_with_source_filtering_fuzzy');

    t.deepEqual(compiled.type, 'search_fallback', 'query type set');
    t.deepEqual(compiled.body, expected, 'search: valid fuzzy search query with source filtering');
    t.end();
  });

  test('categories filter', function(t) {
    var clean = {
      parsed_text: {
        street: 'street value'
      },
      'text': 'test',
      'categories': ['retail','food'],
      fuzziness: 1,
      max_expansions: 20
    };

    var query = generate(clean);

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_with_category_filtering_fuzzy');

    t.deepEqual(compiled.type, 'search_fallback', 'query type set');
    t.deepEqual(compiled.body, expected, 'valid fuzzy search query with category filtering');
    t.end();
  });

};

module.exports.tests.boundary_gid = function(test, common) {
  test('valid boundary.gid filter', function(t) {
    var clean = {
      parsed_text: {
        street: 'street value'
      },
      'text': 'test',
      'boundary.gid': '123'
    };

    var query = generate(clean);

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_boundary_gid');

    t.deepEqual(compiled.type, 'search_fallback', 'query type set');
    t.deepEqual(compiled.body, expected, 'fuzzy search: valid boundary.gid filter');
    t.end();
  });

};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('search query ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
