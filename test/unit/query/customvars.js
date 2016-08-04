var proxyquire = require('proxyquire');
var text_analyzer = require('pelias-text-analyzer');

var customConfig = {
  generate: function generate() {
    return {
      api : {
        query: {
          search: {
            defaults: {
              'ngram:analyzer': 'testAnalyzer'
            }
          },
          reverse: {
            defaults: {
              'boundary:circle:distance_type': 'unusual'
            }
          },
          autocomplete: {
            defaults: {
              'ngram:boost': 200
            }
          }
        }
      }
    };
  }
};

var search = proxyquire('../../../query/search', { 'pelias-config': customConfig });
var reverse = proxyquire('../../../query/reverse', { 'pelias-config': customConfig });
var autocomplete = proxyquire('../../../query/autocomplete', { 'pelias-config': customConfig });

module.exports.tests = {};

var address = 'Polvikatu 3, Tampere';

var queryParams = {
  text: address,
  layers: [ 'address', 'venue' ],
  querySize: 2,
  parsed_text: text_analyzer.parse(address)
};

var reverseParams = {
  'point.lat': 29.55,
  'point.lon': -82.61,
  'boundary.circle.lat': 29.55,
  'boundary.circle.lon': -82.61,
  'boundary.circle.radius': 500
};

var autocompleteParams = {
  text: 'test',
  tokens: ['test'],
  tokens_complete: [],
  tokens_incomplete: ['test']
};

module.exports.tests.query = function(test, common) {
  test('custom search query', function(t) {

    var query = search(queryParams);
    query = JSON.parse( JSON.stringify( query ) );

    t.equal(query.query.bool.must[0].match['name.default'].analyzer,
            'testAnalyzer',
            'expected search query setting'
           );
    t.end();
  });
};

module.exports.tests.reverse = function(test, common) {
  test('custom search query', function(t) {

    var query = reverse(reverseParams);
    query = JSON.parse( JSON.stringify( query ) );

    t.equal(query.query.bool.filter[0].geo_distance.distance_type,
            'unusual',
            'expected reverse geocoding setting'
           );
    t.end();
  });
};

module.exports.tests.autocomplete = function(test, common) {
  test('custom search query', function(t) {

    var query = autocomplete(autocompleteParams);
    query = JSON.parse( JSON.stringify( query ) );

    t.equal(query.query.bool.must[0].constant_score.query.match['name.default'].boost,
            200,
            'expected autocomplete query setting'
           );
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
