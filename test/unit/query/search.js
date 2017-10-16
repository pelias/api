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
  test('valid search + focus + bbox', function(t) {
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
      layers: ['test']
    };

    var query = generate(clean);

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_linguistic_focus_bbox');

    t.deepEqual(compiled.type, 'fallback', 'query type set');
    t.deepEqual(compiled.body, expected, 'search_linguistic_focus_bbox');
    t.end();
  });

  test('valid search + bbox', function(t) {
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
      layers: ['test']
    };

    var query = generate(clean);

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_linguistic_bbox');

    t.deepEqual(compiled.type, 'fallback', 'query type set');
    t.deepEqual(compiled.body, expected, 'search_linguistic_bbox');
    t.end();
  });

  test('valid lingustic-only search', function(t) {
    var clean = {
      parsed_text: {
        street: 'street value'
      },
      text: 'test', querySize: 10,
      layers: ['test']
    };

    var query = generate(clean);

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_linguistic_only');

    t.deepEqual(compiled.type, 'fallback', 'query type set');
    t.deepEqual(compiled.body, expected, 'search_linguistic_only');
    t.end();
  });

  test('search search + focus', function(t) {
    var clean = {
      parsed_text: {
        street: 'street value'
      },
      text: 'test', querySize: 10,
      'focus.point.lat': 29.49136, 'focus.point.lon': -82.50622,
      layers: ['test']
    };

    var query = generate(clean);

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_linguistic_focus');

    t.deepEqual(compiled.type, 'fallback', 'query type set');
    t.deepEqual(compiled.body, expected, 'search_linguistic_focus');
    t.end();
  });

  test('search search + focus on null island', function(t) {
    var clean = {
      parsed_text: {
        street: 'street value'
      },
      text: 'test', querySize: 10,
      'focus.point.lat': 0, 'focus.point.lon': 0,
      layers: ['test']
    };

    var query = generate(clean);

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_linguistic_focus_null_island');

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
    var expected = require('../fixture/search_fallback');

    t.deepEqual(compiled.type, 'fallback', 'query type set');
    t.deepEqual(compiled.body, expected, 'fallbackQuery');
    t.end();

  });

  test('parsed_text with single admin field should return undefined', function(t) {
    ['neighbourhood', 'borough', 'city', 'county', 'state', 'country'].forEach(function(placeType) {
        var clean = {
          parsed_text: {}
        };

        clean.parsed_text[placeType] = placeType + ' value';

        var query = generate(clean);

        t.equals(query, undefined, 'geodisambiguationQuery');

      });

    t.end();

  });

  test('valid boundary.country search', function(t) {
    var clean = {
      parsed_text: {
        street: 'street value'
      },
      text: 'test', querySize: 10,
      layers: ['test'],
      'boundary.country': 'ABC'
    };

    var query = generate(clean);

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_boundary_country');

    t.deepEqual(compiled.type, 'fallback', 'query type set');
    t.deepEqual(compiled.body, expected, 'search: valid boundary.country query');
    t.end();
  });

  test('valid sources filter', function(t) {
    var clean = {
      parsed_text: {
        street: 'street value'
      },
      'text': 'test',
      'sources': ['test_source']
    };

    var query = generate(clean);

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_with_source_filtering');

    t.deepEqual(compiled.type, 'fallback', 'query type set');
    t.deepEqual(compiled.body, expected, 'search: valid search query with source filtering');
    t.end();
  });

  test('categories filter', function(t) {
    var clean = {
      parsed_text: {
        street: 'street value'
      },
      'text': 'test',
      'categories': ['retail','food']
    };

    var query = generate(clean);

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_with_category_filtering');

    t.deepEqual(compiled.type, 'fallback', 'query type set');
    t.deepEqual(compiled.body, expected, 'valid search query with category filtering');
    t.end();
  });

};

module.exports.tests.city_state = function(test, common) {
  test('only city and state set should return query', function(t) {
    var clean = {
      parsed_text: {
        'city': 'city value',
        'state': 'state value'
      }
    };

    var query = generate(clean);

    t.equal(query, undefined, 'should have returned undefined');
    t.end();

  });

  test('only city, state, and country set should return query', function(t) {
    var clean = {
      parsed_text: {
        'city': 'city value',
        'state': 'state value',
        'country': 'country value'
      }
    };

    var query = generate(clean);

    t.equal(query, undefined, 'should have returned undefined');
    t.end();

  });

  test('city-only should return undefined', function(t) {
    var clean = {
      parsed_text: {
        city: 'city value'
      }
    };

    var query = generate(clean);

    t.equals(query, undefined, 'should have returned undefined');
    t.end();

  });

  test('state-only should return undefined', function(t) {
    var clean = {
      parsed_text: {
        state: 'state value'
      }
    };

    var query = generate(clean);

    t.equals(query, undefined, 'should have returned undefined');
    t.end();

  });

  test('city/state with query should return undefined', function(t) {
    var clean = {
      parsed_text: {
        city: 'city value',
        state: 'state value',
        query: 'query value'
      }
    };

    var query = generate(clean);

    t.equals(query, undefined, 'should have returned undefined');
    t.end();

  });

  test('city/state with category should return undefined', function(t) {
    var clean = {
      parsed_text: {
        city: 'city value',
        state: 'state value',
        category: 'category value'
      }
    };

    var query = generate(clean);

    t.equals(query, undefined, 'should have returned undefined');
    t.end();

  });

  test('city/state with number should return undefined', function(t) {
    var clean = {
      parsed_text: {
        city: 'city value',
        state: 'state value',
        number: 'number value'
      }
    };

    var query = generate(clean);

    t.equals(query, undefined, 'should have returned undefined');
    t.end();

  });

  test('city/state with neighbourhood should return undefined', function(t) {
    var clean = {
      parsed_text: {
        city: 'city value',
        state: 'state value',
        neighbourhood: 'neighbourhood value'
      }
    };

    var query = generate(clean);

    t.equals(query, undefined, 'should have returned undefined');
    t.end();

  });

  test('city/state with borough should return undefined', function(t) {
    var clean = {
      parsed_text: {
        city: 'city value',
        state: 'state value',
        borough: 'borough value'
      }
    };

    var query = generate(clean);

    t.equals(query, undefined, 'should have returned undefined');
    t.end();

  });

  test('city/state with postalcode should return undefined', function(t) {
    var clean = {
      parsed_text: {
        city: 'city value',
        state: 'state value',
        postalcode: 'postalcode value'
      }
    };

    var query = generate(clean);

    t.equals(query, undefined, 'should have returned undefined');
    t.end();

  });

  test('city/state with county should return undefined', function(t) {
    var clean = {
      parsed_text: {
        city: 'city value',
        state: 'state value',
        county: 'county value'
      }
    };

    var query = generate(clean);

    t.equals(query, undefined, 'should have returned undefined');
    t.end();

  });

};

module.exports.tests.city_country = function(test, common) {
  test('only city and country set should return query', function(t) {
    var clean = {
      parsed_text: {
        'city': 'city value',
        'country': 'country value'
      }
    };

    var query = generate(clean);

    t.equal(query, undefined, 'should have returned undefined');
    t.end();

  });

  test('city-only should return undefined', function(t) {
    var clean = {
      parsed_text: {
        city: 'city value'
      }
    };

    var query = generate(clean);

    t.equals(query, undefined, 'should have returned undefined');
    t.end();

  });

  test('country-only should return undefined', function(t) {
    var clean = {
      parsed_text: {
        country: 'country value'
      }
    };

    var query = generate(clean);

    t.equals(query, undefined, 'should have returned undefined');
    t.end();

  });

  test('city/country with query should return undefined', function(t) {
    var clean = {
      parsed_text: {
        city: 'city value',
        country: 'country value',
        query: 'query value'
      }
    };

    var query = generate(clean);

    t.equals(query, undefined, 'should have returned undefined');
    t.end();

  });

  test('city/country with category should return undefined', function(t) {
    var clean = {
      parsed_text: {
        city: 'city value',
        country: 'country value',
        category: 'category value'
      }
    };

    var query = generate(clean);

    t.equals(query, undefined, 'should have returned undefined');
    t.end();

  });

  test('city/country with number should return undefined', function(t) {
    var clean = {
      parsed_text: {
        city: 'city value',
        country: 'country value',
        number: 'number value'
      }
    };

    var query = generate(clean);

    t.equals(query, undefined, 'should have returned undefined');
    t.end();

  });

  test('city/country with neighbourhood should return undefined', function(t) {
    var clean = {
      parsed_text: {
        city: 'city value',
        country: 'country value',
        neighbourhood: 'neighbourhood value'
      }
    };

    var query = generate(clean);

    t.equals(query, undefined, 'should have returned undefined');
    t.end();

  });

  test('city/country with borough should return undefined', function(t) {
    var clean = {
      parsed_text: {
        city: 'city value',
        country: 'country value',
        borough: 'borough value'
      }
    };

    var query = generate(clean);

    t.equals(query, undefined, 'should have returned undefined');
    t.end();

  });

  test('city/country with postalcode should return undefined', function(t) {
    var clean = {
      parsed_text: {
        city: 'city value',
        country: 'country value',
        postalcode: 'postalcode value'
      }
    };

    var query = generate(clean);

    t.equals(query, undefined, 'should have returned undefined');
    t.end();

  });

  test('city/country with county should return undefined', function(t) {
    var clean = {
      parsed_text: {
        city: 'city value',
        country: 'country value',
        county: 'county value'
      }
    };

    var query = generate(clean);

    t.equals(query, undefined, 'should have returned undefined');
    t.end();

  });

  test('valid postalcode only search', function(t) {
    var clean = {
      parsed_text: {
        postalcode: '90210'
      },
      text: '90210'
    };

    var query = generate(clean);

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_fallback_postalcode_only');

    t.deepEqual(compiled.type, 'fallback', 'query type set');
    t.deepEqual(compiled.body, expected, 'search_fallback_postalcode_only');
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
