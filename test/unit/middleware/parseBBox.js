var parseBBox = require('../../../middleware/parseBBox')();

module.exports.tests = {};

module.exports.tests.computeDistance = function(test, common) {
  test('valid bounding_box json', function(t) {
    var res = {
      results: [
        {
          data: [
            {
              bounding_box: '{"min_lat":40.6514712164,"max_lat":40.6737320588,"min_lon":-73.8967895508,"max_lon":-73.8665771484}'
            }
          ]
        }
      ]
    };

    var expected = {
      results: [
        {
          data: [
            {
              bounding_box: {
                min_lat: 40.6514712164,
                max_lat: 40.6737320588,
                min_lon: -73.8967895508,
                max_lon: -73.8665771484
              }
            }
          ]
        }
      ]
    };

    parseBBox({}, res, function () {
      t.deepEquals(res, expected, 'correct bounding_box');
      t.end();
    });
  });

  test('invalid bounding_box json', function(t) {
    var res = {
      results: [
        {
          data: [
            {
              bounding_box: 'garbage json'
            }
          ]
        }
      ]
    };

    var expected = {
      results: [
        {
          data: [
            {}
          ]
        }
      ]
    };

    parseBBox({}, res, function () {
      t.deepEquals(res, expected, 'correct bounding_box');
      t.end();
    });
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('[middleware] parseBBox: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
