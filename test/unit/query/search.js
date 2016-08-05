var generate = require('../../../query/search');
var text_analyzer = require('pelias-text-analyzer');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof generate, 'function', 'valid function');
    t.end();
  });
};

module.exports.tests.query = function(test, common) {
  test('valid search + focus + bbox', function(t) {
    var query = generate({
      text: 'test', querySize: 10,
      'focus.point.lat': 29.49136, 'focus.point.lon': -82.50622,
      'boundary.rect.min_lat': 47.47,
      'boundary.rect.max_lon': -61.84,
      'boundary.rect.max_lat': 11.51,
      'boundary.rect.min_lon': -103.16,
      layers: ['test']
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_linguistic_focus_bbox');

    t.deepEqual(compiled, expected, 'search_linguistic_focus_bbox');
    t.end();
  });

  test('valid search + bbox', function(t) {
    var query = generate({
      text: 'test', querySize: 10,
      'boundary.rect.min_lat': 47.47,
      'boundary.rect.max_lon': -61.84,
      'boundary.rect.max_lat': 11.51,
      'boundary.rect.min_lon': -103.16,
      layers: ['test']
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_linguistic_bbox');

    t.deepEqual(compiled, expected, 'search_linguistic_bbox');
    t.end();
  });

  test('valid lingustic-only search', function(t) {
    var query = generate({
      text: 'test', querySize: 10,
      layers: ['test']
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_linguistic_only');

    t.deepEqual(compiled, expected, 'search_linguistic_only');
    t.end();
  });

  test('search search + focus', function(t) {
    var query = generate({
      text: 'test', querySize: 10,
      'focus.point.lat': 29.49136, 'focus.point.lon': -82.50622,
      layers: ['test']
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_linguistic_focus');

    t.deepEqual(compiled, expected, 'search_linguistic_focus');
    t.end();
  });

  test('search search + focus on null island', function(t) {
    var query = generate({
      text: 'test', querySize: 10,
      'focus.point.lat': 0, 'focus.point.lon': 0,
      layers: ['test']
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_linguistic_focus_null_island');

    t.deepEqual(compiled, expected, 'search_linguistic_focus_null_island');
    t.end();
  });

  test('valid query with a full valid address', function(t) {
    var address = '123 main st new york ny 10010 US';
    var query = generate({ text: address,
      layers: [ 'address', 'venue', 'country', 'region', 'county', 'neighbourhood', 'locality', 'localadmin' ],
      querySize: 10,
      parsed_text: text_analyzer.parse(address),
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_full_address');

    t.deepEqual(compiled, expected, 'search_full_address');
    t.end();
  });

  test('valid query with partial address', function(t) {
    var partial_address = 'soho grand, new york';
    var query = generate({ text: partial_address,
      layers: [ 'address', 'venue', 'country', 'region', 'county', 'neighbourhood', 'locality', 'localadmin' ],
      querySize: 10,
      parsed_text: text_analyzer.parse(partial_address),
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_partial_address');

    t.deepEqual(compiled, expected, 'search_partial_address');
    t.end();
  });

  test('valid query with regions in address', function(t) {
    var partial_address = '1 water st manhattan ny';
    var query = generate({ text: partial_address,
      layers: [ 'address', 'venue', 'country', 'region', 'county', 'neighbourhood', 'locality', 'localadmin' ],
      querySize: 10,
      parsed_text: text_analyzer.parse(partial_address),
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_regions_address');

    t.deepEqual(compiled, expected, 'search_regions_address');
    t.end();
  });

  test('valid boundary.country search', function(t) {
    var query = generate({
      text: 'test', querySize: 10,
      layers: ['test'],
      'boundary.country': 'ABC'
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_boundary_country');

    t.deepEqual(compiled, expected, 'search: valid boundary.country query');
    t.end();
  });

  test('valid sources filter', function(t) {
    var query = generate({
      'text': 'test',
      'sources': ['test_source']
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_with_source_filtering');

    t.deepEqual(compiled, expected, 'search: valid search query with source filtering');
    t.end();
  });

  test('categories filter', function(t) {
    var query = generate({
      'text': 'test',
      'categories': ['retail','food']
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_with_category_filtering');

    t.deepEqual(compiled, expected, 'valid search query with category filtering');
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
