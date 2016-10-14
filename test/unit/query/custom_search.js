
// test creating a custom query using pelias config file
var text_analyzer = require('pelias-text-analyzer');
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

var generate = proxyquire('../../../query/search_original',  { 'pelias-config': customConfig });

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
      parsed_text: text_analyzer.parse(address),
    });
    var querystr = JSON.stringify( query );
    var compiled = JSON.parse( querystr );

    var expected = require('../fixture/search_custom_query');

    t.deepEqual(compiled.body, expected, 'valid multiphrase search query');
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
