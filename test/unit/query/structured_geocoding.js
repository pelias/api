var generate = require('../../../query/structured_geocoding');
var fs = require('fs');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof generate, 'function', 'valid function');
    t.end();
  });
};

module.exports.tests.query = function(test, common) {
  test('valid search + focus + bbox', function(t) {
    var clean = {
      parsed_text: {
      },
      text: 'test',
      querySize: 10,
      'focus.point.lat': 29.49136, 'focus.point.lon': -82.50622,
      'boundary.rect.min_lat': 47.47,
      'boundary.rect.max_lon': -61.84,
      'boundary.rect.max_lat': 11.51,
      'boundary.rect.min_lon': -103.16,
      layers: ['test']
    };

    var query = generate(clean);

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/structured_geocoding/linguistic_focus_bbox');

    t.deepEqual(compiled.type, 'fallback', 'query type set');
    t.deepEqual(compiled.body, expected, 'search_linguistic_focus_bbox');
    t.end();
  });

  test('valid search + bbox', function(t) {
    var clean = {
      parsed_text: {
      },
      text: 'test',
      querySize: 10,
      'boundary.rect.min_lat': 47.47,
      'boundary.rect.max_lon': -61.84,
      'boundary.rect.max_lat': 11.51,
      'boundary.rect.min_lon': -103.16,
      layers: ['test']
    };

    var query = generate(clean);

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/structured_geocoding/linguistic_bbox');

    t.deepEqual(compiled.type, 'fallback', 'query type set');
    t.deepEqual(compiled.body, expected, 'search_linguistic_bbox');
    t.end();
  });

  test('valid lingustic-only search', function(t) {
    var clean = {
      parsed_text: {
      },
      text: 'test', querySize: 10,
      layers: ['test']
    };

    var query = generate(clean);

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/structured_geocoding/linguistic_only');

    t.deepEqual(compiled.type, 'fallback', 'query type set');
    t.deepEqual(compiled.body, expected, 'search_linguistic_only');
    t.end();
  });

  test('search search + focus', function(t) {
    var clean = {
      parsed_text: {
      },
      text: 'test', querySize: 10,
      'focus.point.lat': 29.49136, 'focus.point.lon': -82.50622,
      layers: ['test']
    };

    var query = generate(clean);

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/structured_geocoding/linguistic_focus');

    t.deepEqual(compiled.type, 'fallback', 'query type set');
    t.deepEqual(compiled.body, expected, 'search_linguistic_focus');
    t.end();
  });

  test('search search + viewport', function(t) {
    var clean = {
      parsed_text: {
      },
      text: 'test', querySize: 10,
      'focus.viewport.min_lat': 28.49136,
      'focus.viewport.max_lat': 30.49136,
      'focus.viewport.min_lon': -87.50622,
      'focus.viewport.max_lon': -77.50622,
      layers: ['test']
    };

    var query = generate(clean);

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/structured_geocoding/linguistic_viewport');

    t.deepEqual(compiled.type, 'fallback', 'query type set');
    t.deepEqual(compiled.body, expected, 'search_linguistic_viewport');
    t.end();
  });

  // viewport scale sizing currently disabled.
  // ref: https://github.com/pelias/api/pull/388
  test('search with viewport diagonal < 1km should set scale to 1km', function(t) {
    var clean = {
      parsed_text: {
      },
      text: 'test', querySize: 10,
      'focus.viewport.min_lat': 28.49135,
      'focus.viewport.max_lat': 28.49137,
      'focus.viewport.min_lon': -87.50622,
      'focus.viewport.max_lon': -87.50624,
      layers: ['test']
    };

    var query = generate(clean);

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/structured_geocoding/linguistic_viewport_min_diagonal');

    t.deepEqual(compiled.type, 'fallback', 'query type set');
    t.deepEqual(compiled.body, expected, 'valid search query');
    t.end();
  });

  test('search search + focus on null island', function(t) {
    var clean = {
      parsed_text: {
      },
      text: 'test', querySize: 10,
      'focus.point.lat': 0, 'focus.point.lon': 0,
      layers: ['test']
    };

    var query = generate(clean);

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/structured_geocoding/linguistic_focus_null_island');

    t.deepEqual(compiled.type, 'fallback', 'query type set');
    t.deepEqual(compiled.body, expected, 'search_linguistic_focus_null_island');
    t.end();
  });

  test('parsed_text with all fields should use FallbackQuery', function(t) {
    var clean = {
      parsed_text: {
        query: 'query value',
        category: 'category value',
        number: 'number value',
        street: 'street value',
        neighbourhood: 'neighbourhood value',
        borough: 'borough value',
        postalcode: 'postalcode value',
        city: 'city value',
        county: 'county value',
        state: 'state value',
        country: 'country value'
      }
    };

    var query = generate(clean);

    var compiled = JSON.parse(JSON.stringify(query));
    var expected = require('../fixture/structured_geocoding/fallback');

    t.deepEqual(compiled.type, 'fallback', 'query type set');
    t.deepEqual(compiled.body, expected, 'fallbackQuery');
    t.end();

  });

  test('parsed_text with all fields should use FallbackQuery', function(t) {
    var clean = {
      parsed_text: {
        postalcode: 'postalcode value'
      }
    };

    var query = generate(clean);

    var compiled = JSON.parse(JSON.stringify(query));
    var expected = require('../fixture/structured_geocoding/postalcode_only');

    t.deepEqual(compiled.type, 'fallback', 'query type set');
    t.deepEqual(compiled.body, expected, 'structured postalcode only');
    t.end();

  });

  test('valid boundary.country search', function(t) {
    var clean = {
      parsed_text: {
      },
      text: 'test', querySize: 10,
      layers: ['test'],
      'boundary.country': 'ABC'
    };

    var query = generate(clean);

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/structured_geocoding/boundary_country');

    t.deepEqual(compiled.type, 'fallback', 'query type set');
    t.deepEqual(compiled.body, expected, 'search: valid boundary.country query');
    t.end();
  });

  test('valid sources filter', function(t) {
    var clean = {
      parsed_text: {
      },
      'text': 'test',
      'sources': ['test_source']
    };

    var query = generate(clean);

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/structured_geocoding/with_source_filtering');

    t.deepEqual(compiled.type, 'fallback', 'query type set');
    t.deepEqual(compiled.body, expected, 'search: valid search query with source filtering');
    t.end();
  });

};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('structured_geocoding query ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
