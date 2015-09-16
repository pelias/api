var generate = require('../../../query/search');
var parser = require('../../../helper/query_parser');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof generate, 'function', 'valid function');
    t.end();
  });
};

var sort = require('../fixture/sort_default');

module.exports.tests.query = function(test, common) {
  test('valid search + focus + bbox', function(t) {
    var query = generate({
      text: 'test', size: 10,
      lat: 29.49136, lon: -82.50622,
      bbox: {
        top: 47.47,
        right: -61.84,
        bottom: 11.51,
        left: -103.16
      },
      layers: ['test']
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_linguistic_focus_bbox');
    expected.sort = sort;

    t.deepEqual(compiled, expected, 'valid search query');
    t.end();
  });

  test('valid search + bbox', function(t) {
    var query = generate({
      text: 'test', size: 10,
      bbox: {
        top: 47.47,
        right: -61.84,
        bottom: 11.51,
        left: -103.16
      },
      layers: ['test']
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_linguistic_bbox');
    expected.sort = sort;

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
    expected.sort = sort;

    t.deepEqual(compiled, expected, 'valid search query');
    t.end();
  });

  test('search search + focus', function(t) {
    var query = generate({
      text: 'test', size: 10,
      lat: 29.49136, lon: -82.50622,
      layers: ['test']
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_linguistic_focus');
    expected.sort = sort;

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
    expected.sort = sort;

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
    expected.sort = sort;

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
    expected.sort = sort;

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
    expected.sort = sort;

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
