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
    distance(req, res, function () {
      t.equal(res.results.data[0].distance, expected, 'correct distance computed');
      t.end();
    });
  });

  test('results array with valid lat/lon', function(t) {
    var req = {
      clean: [
        {
          'point.lat': 50,
          'point.lon': -81
        },
        {
          'point.lat': 45,
          'point.lon': -77
        }
      ]
    };
    var res = {
      results: [
        {
          data: [
            {
              center_point: {
                lat: 45,
                lon: -75
              }
            }
          ]
        },
        {
          data: [
            {
              center_point: {
                lat: 40,
                lon: -71
              }
            },
            {
              center_point: {
                lat: 41,
                lon: -71
              }
            }
          ]
        }
      ]
    };

    distance(req, res, function () {
      t.equal(res.results[0].data[0].distance, 716.025, 'result 0 data 0: correct distance computed');
      t.equal(res.results[1].data[0].distance, 742.348, 'result 1 data 0: correct distance computed');
      t.equal(res.results[1].data[1].distance, 660.586, 'result 1 data 1: correct distance computed');
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
