
var generate = require('../../../query/reverse');

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
      lat: 29.49136, lon: -82.50622
    });
    var expected = {
      query:{
        filtered : {
          query : {
              match_all : {}
          },
          filter : {
              geo_distance : {
                  distance : '1km',
                  center_point : {
                    lat: 29.49136, 
                    lon: -82.50622
                  }
              }
          }
        }
      },
      size: 1
    };
    
    t.deepEqual(query, expected, 'valid reverse query');
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('reverse query ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};