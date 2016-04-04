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
	      'ngram:multifield': ['name.*'],
	      'phrase:multifield': ['name.*']
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
