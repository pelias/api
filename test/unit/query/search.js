var generate = require('../../../query/search');
var parser = require('../../../helper/text_parser');

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

    t.deepEqual(compiled, expected, 'valid search query');
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

    t.deepEqual(compiled, expected, 'valid search query');
    t.end();
  });

  test('valid lingustic-only search', function(t) {
    var query = generate({
      text: 'test', querySize: 10,
      layers: ['test']
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_linguistic_only');

    t.deepEqual(compiled, expected, 'valid search query');
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

    t.deepEqual(compiled, expected, 'valid search query');
    t.end();
  });

  test('search search + viewport', function(t) {
    var query = generate({
      text: 'test', querySize: 10,
      'focus.viewport.min_lat': 28.49136,
      'focus.viewport.max_lat': 30.49136,
      'focus.viewport.min_lon': -87.50622,
      'focus.viewport.max_lon': -77.50622,
      layers: ['test']
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_linguistic_viewport');

    t.deepEqual(compiled, expected, 'valid search query');
    t.end();
  });

  // viewport scale sizing currently disabled.
  // ref: https://github.com/pelias/api/pull/388
  // test('search with viewport diagonal < 1km should set scale to 1km', function(t) {
  //   var query = generate({
  //     text: 'test', querySize: 10,
  //     'focus.viewport.min_lat': 28.49135,
  //     'focus.viewport.max_lat': 28.49137,
  //     'focus.viewport.min_lon': -87.50622,
  //     'focus.viewport.max_lon': -87.50624,
  //     layers: ['test']
  //   });
  //
  //   var compiled = JSON.parse( JSON.stringify( query ) );
  //   var expected = require('../fixture/search_linguistic_viewport_min_diagonal');
  //
  //   t.deepEqual(compiled, expected, 'valid search query');
  //   t.end();
  // });

  test('search search + focus on null island', function(t) {
    var query = generate({
      text: 'test', querySize: 10,
      'focus.point.lat': 0, 'focus.point.lon': 0,
      layers: ['test']
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_linguistic_focus_null_island');

    t.deepEqual(compiled, expected, 'valid search query');
    t.end();
  });

  test('valid query with a full valid address', function(t) {
    var address = '123 main st new york ny 10010 US';
    var query = generate({ text: address,
      layers: [ 'address', 'venue', 'country', 'region', 'county', 'neighbourhood', 'locality', 'localadmin' ],
      querySize: 10,
      parsed_text: parser.get_parsed_address(address),
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_full_address');

    t.deepEqual(compiled.query.filtered.query.bool.should, expected.query.filtered.query.bool.should, 'valid boundary.country query');

    [ { match: { 'phrase.default': { analyzer: 'peliasPhrase', boost: 1, query: '123 main st', slop: 2, type: 'phrase' } } }, { function_score: { boost_mode: 'replace', filter: { exists: { field: 'popularity' } }, functions: [ { field_value_factor: [Object], weight: 1 } ], max_boost: 20, query: { match: { 'phrase.default': [Object] } }, score_mode: 'first' } }, { function_score: { boost_mode: 'replace', filter: { exists: { field: 'population' } }, functions: [ { field_value_factor: [Object], weight: 2 } ], max_boost: 20, query: { match: { 'phrase.default': [Object] } }, score_mode: 'first' } }, { match: { 'address.number': { analyzer: 'peliasHousenumber', boost: 2, query: '123' } } }, { match: { 'address.street': { analyzer: 'peliasStreet', boost: 5, query: 'main st' } } }, { match: { 'address.zip': { analyzer: 'peliasZip', boost: 20, query: '10010' } } }, { match: { 'parent.country_a': { analyzer: 'standard', boost: 5, query: 'USA' } } }, { match: { 'parent.country': { analyzer: 'peliasAdmin', boost: 4, query: 'new york' } } }, { match: { 'parent.region': { analyzer: 'peliasAdmin', boost: 3, query: 'new york' } } }, { match: { 'parent.region_a': { analyzer: 'peliasAdmin', boost: 3, query: 'NY' } } }, { match: { 'parent.county': { analyzer: 'peliasAdmin', boost: 2, query: 'new york' } } }, { match: { 'parent.localadmin': { analyzer: 'peliasAdmin', boost: 1, query: 'new york' } } }, { match: { 'parent.locality': { analyzer: 'peliasAdmin', boost: 1, query: 'new york' } } }, { match: { 'parent.neighbourhood': { analyzer: 'peliasAdmin', boost: 1, query: 'new york' } } } ]
    [ { match: { 'phrase.default': { analyzer: 'peliasPhrase', boost: 1, query: '123 main st', slop: 2, type: 'phrase' } } }, { function_score: { boost_mode: 'replace', filter: { exists: { field: 'popularity' } }, functions: [ { field_value_factor: [Object], weight: 1 } ], max_boost: 20, query: { match: { 'phrase.default': [Object] } }, score_mode: 'first' } }, { function_score: { boost_mode: 'replace', filter: { exists: { field: 'population' } }, functions: [ { field_value_factor: [Object], weight: 2 } ], max_boost: 20, query: { match: { 'phrase.default': [Object] } }, score_mode: 'first' } }, { match: { 'address.number': { analyzer: 'peliasHousenumber', boost: 2, query: '123' } } }, { match: { 'address.street': { analyzer: 'peliasStreet', boost: 5, query: 'main st' } } }, { match: { 'address.zip': { analyzer: 'peliasZip', boost: 20, query: '10010' } } }, { match: { 'parent.country': { analyzer: 'peliasAdmin', boost: 4, query: 'new york' } } }, { match: { 'parent.country_a': { analyzer: 'standard', boost: 5, query: 'USA' } } }, { match: { 'parent.region': { analyzer: 'peliasAdmin', boost: 3, query: 'new york' } } }, { match: { 'parent.region_a': { analyzer: 'peliasAdmin', boost: 3, query: 'NY' } } }, { match: { 'parent.county': { analyzer: 'peliasAdmin', boost: 2, query: 'new york' } } }, { match: { 'parent.localadmin': { analyzer: 'peliasAdmin', boost: 1, query: 'new york' } } }, { match: { 'parent.locality': { analyzer: 'peliasAdmin', boost: 1, query: 'new york' } } }, { match: { 'parent.neighbourhood': { analyzer: 'peliasAdmin', boost: 1, query: 'new york' } } } ]


    //t.deepEqual(compiled, expected, 'valid search query');
    t.end();
  });

  test('valid query with partial address', function(t) {
    var partial_address = 'soho grand, new york';
    var query = generate({ text: partial_address,
      layers: [ 'address', 'venue', 'country', 'region', 'county', 'neighbourhood', 'locality', 'localadmin' ],
      querySize: 10,
      parsed_text: parser.get_parsed_address(partial_address),
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_partial_address');

    t.deepEqual(compiled, expected, 'valid search query');
    t.end();
  });

  test('valid query with regions in address', function(t) {
    var partial_address = '1 water st manhattan ny';
    var query = generate({ text: partial_address,
      layers: [ 'address', 'venue', 'country', 'region', 'county', 'neighbourhood', 'locality', 'localadmin' ],
      querySize: 10,
      parsed_text: parser.get_parsed_address(partial_address),
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_regions_address');

    t.deepEqual(compiled, expected, 'valid search query');
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

    t.deepEqual(compiled, expected, 'valid boundary.country query');
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
