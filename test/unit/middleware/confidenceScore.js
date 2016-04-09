var confidenceScore = require('../../../middleware/confidenceScore')();

module.exports.tests = {};

module.exports.tests.confidenceScore = function(test, common) {

  test('empty res and req should not throw exception', function(t) {
    function testIt() {
      confidenceScore({}, {}, function() {});
    }

    t.doesNotThrow(testIt, 'an exception should not have been thrown');
    t.end();
  });

  test('res.results without parsed_text should not throw exception', function(t) {
    var req = {};
    var res = {
      results: {
        data: [{
          name: 'foo'
        }],
        meta: [10]
      }
    };

    function testIt() {
      confidenceScore(req, res, function() {});
    }

    t.doesNotThrow(testIt, 'an exception should not have been thrown');
    t.end();
  });

  test('hit without address should not error', function(t) {
    var req = {
      clean: {
        text: 'test name3',
        parsed_text: {
          postalcode: 12345
        }
      }
    };
    var res = {
      results: {
        data: [{
          name: {
            default: 'foo'
          }
        }],
        meta: {
          scores: [10]
        }
      }
    };

    function testIt() {
      confidenceScore(req, res, function() {});
    }

    t.doesNotThrow(testIt, 'an exception should not have been thrown with no address');
    t.end();
  });


  test('res.results without parsed_text should not throw exception', function(t) {
    var req = {
      clean: { text: 'test name1' }
    };
    var res = {
      results: {
        data: [{
          _score: 10,
          found: true,
          value: 1,
          center_point: { lat: 100.1, lon: -50.5 },
          name: { default: 'test name1' },
          parent: {
            country: ['country1'],
            region: ['state1'],
            county: ['city1']
          }
        }, {
          _score: 20,
          value: 2,
          center_point: { lat: 100.2, lon: -51.5 },
          name: { default: 'test name2' },
          parent: {
            country: ['country2'],
            region: ['state2'],
            county: ['city2']
          }
        }],
        meta: {scores: [10]}
      }
    };

    confidenceScore(req, res, function() {});
    t.equal(res.results.data[0].confidence, 0.6, 'score was set');
    t.end();
  });

  test('iterate over res.results when it is an array', function(t) {
    var req = {
      clean: [ { text: 'test name2' }, { text: 'test name3' } ]
    };

    var res = {
      results: [
        {
          data: [{
            _score: 10,
            found: true,
            value: 1,
            center_point: { lat: 100.1, lon: -50.5 },
            name: { default: 'test name1' },
            admin0: 'country1', admin1: 'state1', admin2: 'city1'
          }, {
            value: 2,
            center_point: { lat: 100.2, lon: -51.5 },
            name: { default: 'test name2' },
            admin0: 'country2', admin1: 'state2', admin2: 'city2',
            _score: 20
          }],
          meta: {scores: [10, 20]}
        },
        {
          data: [{
            _score: 2,
            found: true,
            value: 3,
            center_point: { lat: 100.3, lon: -52.5 },
            name: { default: 'test name3' },
            admin0: 'country3', admin1: 'state3', admin2: 'city3'
          }],
          meta: {scores: [2]}
        }
      ]
    };

    confidenceScore(req, res, function() {});
    t.equal(res.results[0].data[0].confidence, 0.653, 'result 0 data 0 score was set');
    t.equal(res.results[0].data[1].confidence, 0.738, 'result 0 data 1 score was set');
    t.equal(res.results[1].data[0].confidence, 0.6, 'result 1 data 0 score was set');
    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('[middleware] confidenceScore: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
