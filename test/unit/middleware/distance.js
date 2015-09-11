var distance = require('../../../middleware/distance')();

module.exports.tests = {};

module.exports.tests.computeDistance = function(test, common) {
  test('valid lat/lon and results', function(t) {
    var req = {
      clean: {
        lat: 45,
        lon: -77
      },
      results: {
        data: [
          {
            center_point: {
              lat: 40,
              lon: -71
            }
          }
        ]
      }
    };

    var expected = 742.348;
    distance(req, null, function () {
      t.equal(req.results.data[0].distance, expected, 'correct distance computed');
      t.end();
    });
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('[middleware] distance: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
