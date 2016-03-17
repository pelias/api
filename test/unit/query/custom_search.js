// test creating a custom query using pelias config file
var parser = require('../../../helper/text_parser');
var proxyquire = require('proxyquire');

var customConfig = {
  generate: function generate() {
    return {
      api : {
	query: {
	  search: {
	    defaults: {
	      'multingram:fields': ['name.*']
	    },
	    views: {
	      score: [
		['boundary_country', null, false, 'must'],
		['multingrams', null, false, 'must'], // non-standard part

		['phrase', null, false, 'should'],
		['focus', 'phrase', true],
		['popularity', 'phrase', true],
		['population', 'phrase', true],

		['address', 'housenumber'],
		['address', 'street'],
		['address', 'postcode'],

		['admin', 'country'],
		['admin', 'country_a'],
		['admin', 'region'],
		['admin', 'region_a'],
		['admin', 'county'],
		['admin', 'localadmin'],
		['admin', 'locality'],
		['admin', 'neighbourhood']
	      ],
	      filter: [
		['boundary_circle'],
		['boundary_rect'],
		['sources']
	      ]
	    }
	  }
	}
      }
    };
  }
};

var generate = proxyquire('../../../query/search',  { 'pelias-config': customConfig });

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof generate, 'function', 'valid function');
    t.end();
  });
};

module.exports.tests.query = function(test, common) {
  test('valid multiphrase query with a full valid address', function(t) {
    var address = '123 main st new york ny 10010 US';
    var query = generate({ text: address,
      layers: [ 'address', 'venue', 'country', 'region', 'county', 'neighbourhood', 'locality', 'localadmin' ],
      querySize: 10,
      parsed_text: parser.get_parsed_address(address),
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/search_custom_query');

    t.deepEqual(compiled, expected, 'valid multiphrase search query');
    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('custom search query ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
