
var generate = require('../../../query/search');
var admin_boost = 'admin_boost';
var population = 'population';
var popularity = 'popularity';
var category = 'category';
var parser = require('../../../helper/query_parser');
var category_weights = require('../../../helper/category_weights');
var admin_weights = require('../../../helper/admin_weights');
var address_weights = require('../../../helper/address_weights');
var weights = require('pelias-suggester-pipeline').weights;


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
      input: 'test', size: 10,
      lat: 29.49136, lon: -82.50622,
      bbox: {
        top: 47.47, 
        right: -61.84, 
        bottom: 11.51, 
        left: -103.16
      },
      layers: ['test']
    });

    var expected = require('../fixture/search_linguistic_focus_bbox');
    expected.sort = sort;

    t.deepEqual(query, expected, 'valid search query');
    t.end();
  });

  test('valid search + bbox', function(t) {
    var query = generate({
      input: 'test', size: 10,
      bbox: {
        top: 47.47, 
        right: -61.84, 
        bottom: 11.51, 
        left: -103.16
      },
      layers: ['test']
    });

    var expected = require('../fixture/search_linguistic_bbox');
    expected.sort = sort;
    
    t.deepEqual(query, expected, 'valid search query');
    t.end();
  });

  test('valid lingustic-only search', function(t) {
    var query = generate({
      input: 'test', size: 10,
      layers: ['test']
    });

    var expected = require('../fixture/search_linguistic_only');
    expected.sort = sort;

    t.deepEqual(query, expected, 'valid search query');
    t.end();
  });

  test('search search + focus', function(t) {
    var query = generate({
      input: 'test', size: 10,
      lat: 29.49136, lon: -82.50622,
      layers: ['test']
    });

    var expected = require('../fixture/search_linguistic_focus');
    expected.sort = sort;

    t.deepEqual(query, expected, 'valid search query');
    t.end();
  });

  test('valid query with a full valid address', function(t) {
    var address = '123 main st new york ny 10010 US';
    var query = generate({ input: address, 
      layers: [ 'geoname', 'osmnode', 'osmway', 'admin0', 'admin1', 'admin2', 'neighborhood', 
                'locality', 'local_admin', 'osmaddress', 'openaddresses' ], 
      size: 10,
      details: true,
      parsed_input: parser.get_parsed_address(address),
    });

    var expected = require('../fixture/search_full_address');

    t.deepEqual(query, expected, 'valid search query');
    t.end();
  });
  
  test('valid query with partial address', function(t) {
    var partial_address = 'soho grand, new york';
    var query = generate({ input: partial_address, 
      layers: [ 'geoname', 'osmnode', 'osmway', 'admin0', 'admin1', 'admin2', 'neighborhood', 
                'locality', 'local_admin', 'osmaddress', 'openaddresses' ], 
      size: 10,
      details: true,
      parsed_input: parser.get_parsed_address(partial_address),
    });

    var expected = require('../fixture/search_partial_address');
    expected.sort = sort;

    t.deepEqual(query, expected, 'valid search query');
    t.end();
  });

  test('valid query with regions in address', function(t) {
    var partial_address = '1 water st manhattan ny';
    var query = generate({ input: partial_address,
      layers: [ 'geoname', 'osmnode', 'osmway', 'admin0', 'admin1', 'admin2', 'neighborhood',
        'locality', 'local_admin', 'osmaddress', 'openaddresses' ],
      size: 10,
      details: true,
      parsed_input: parser.get_parsed_address(partial_address),
    });

    var expected = require('../fixture/search_regions_address');

    t.deepEqual(query, expected, 'valid search query');
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
