var distance = require('../../../middleware/distance')();

module.exports.tests = {};

module.exports.tests.computeDistance = function(test, common) {
  test('valid lat/lon and results', function(t) {
    var req = {
      clean: {
        'point.lat': 45,
        'point.lon': -77
      }
    };
    var res = {
      data: [
        {
          center_point: {
            lat: 40,
            lon: -71
          }
        }
      ]
    };

    var expected = 742.348;
    distance(req, res, function () {
      t.equal(res.data[0].distance, expected, 'correct distance computed');
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
