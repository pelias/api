var parseBBox = require('../../../middleware/parseBBox')();

const proxyquire = require('proxyquire').noCallThru();

module.exports.tests = {};

module.exports.tests.computeDistance = function(test, common) {
  test('valid bounding_box json', function(t) {
    var res = {
      data: [
        {
          bounding_box: '{"min_lat":40.6514712164,"max_lat":40.6737320588,"min_lon":-73.8967895508,"max_lon":-73.8665771484}'
        }
      ]
    };

    var expected = {
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
    };

    parseBBox({}, res, function () {
      t.deepEquals(res, expected, 'correct bounding_box');
      t.end();
    });
  });

  test('invalid bounding_box json', function(t) {
    var res = {
      data: [
        {
          bounding_box: 'garbage json'
        }
      ]
    };

    var expected = {
      data: [
        {}
      ]
    };

    const parseBBox = proxyquire('../../../middleware/parseBBox', {
      'pelias-logger': {
        get: () => {
          return {
            error: (msg1, msg2) => {
              t.equals(msg1, 'Invalid bounding_box json string:');
              t.deepEquals(msg2, { bounding_box: 'garbage json' });
            }
          };

        }
      }
    })();

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
