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
      text: 'test', size: 10,
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
      text: 'test', size: 10,
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
      text: 'test', size: 10,
      layers: ['test']
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_linguistic_only');

    t.deepEqual(compiled, expected, 'valid search query');
    t.end();
  });

  test('search search + focus', function(t) {
    var query = generate({
      text: 'test', size: 10,
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
      text: 'test', size: 10,
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

  test('search with viewport diagonal < 1km should set scale to 1km', function(t) {
    var query = generate({
      text: 'test', size: 10,
      'focus.viewport.min_lat': 28.49135,
      'focus.viewport.max_lat': 28.49137,
      'focus.viewport.min_lon': -87.50622,
      'focus.viewport.max_lon': -87.50624,
      layers: ['test']
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_linguistic_viewport_min_diagonal');

    t.deepEqual(compiled, expected, 'valid search query');
    t.end();
  });

  test('search search + focus on null island', function(t) {
    var query = generate({
      text: 'test', size: 10,
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
      layers: [ 'geoname', 'osmnode', 'osmway', 'admin0', 'admin1', 'admin2', 'neighborhood',
                'locality', 'local_admin', 'osmaddress', 'openaddresses' ],
      size: 10,
      parsed_text: parser.get_parsed_address(address),
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_full_address');

    t.deepEqual(compiled, expected, 'valid search query');
    t.end();
  });

  test('valid query with partial address', function(t) {
    var partial_address = 'soho grand, new york';
    var query = generate({ text: partial_address,
      layers: [ 'geoname', 'osmnode', 'osmway', 'admin0', 'admin1', 'admin2', 'neighborhood',
                'locality', 'local_admin', 'osmaddress', 'openaddresses' ],
      size: 10,
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
      layers: [ 'geoname', 'osmnode', 'osmway', 'admin0', 'admin1', 'admin2', 'neighborhood',
        'locality', 'local_admin', 'osmaddress', 'openaddresses' ],
      size: 10,
      parsed_text: parser.get_parsed_address(partial_address),
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_regions_address');

    t.deepEqual(compiled, expected, 'valid search query');
    t.end();
  });

  test('valid boundary.country search', function(t) {
    var query = generate({
      text: 'test', size: 10,
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
