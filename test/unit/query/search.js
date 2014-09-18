
var generate = require('../../../query/search');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof generate, 'function', 'valid function');
    t.end();
  });
};

module.exports.tests.query = function(test, common) {
  test('valid query', function(t) {
    var query = generate({
      input: 'test', size: 10,
      lat: 0, lon: 0,
      layers: ['test']
    });
    var expected = {
      query: {
        filtered : {
          query : {
              match : {
                "name.default": 'test'
              }
          },
          filter : {
              geo_distance : {
                  distance : '200km',
                  center_point : {
                    lat: 0, 
                    lon: 0
                  }
              }
          }
        }
      },
      size: 10
    };
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