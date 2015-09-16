var confidenceScoreReverse = require('../../../middleware/confidenceScoreReverse')();

module.exports.tests = {};

module.exports.tests.confidenceScoreReverse = function(test, common) {
  test('distance == 0m should be given score 1.0', function(t) {
    var req = {
      results: {
        data: [
          {
            distance: 0
          }
        ]
      }
    };

    confidenceScoreReverse(req, null, function() {
      t.equal(req.results.data[0].confidence, 1.0, 'score should be exact confidence');
      t.end();
    });

  });

  test('0m < distance < 10m should be given score 0.9', function(t) {
    var req = {
      results: {
        data: [
          {
            distance: 0.0001
          },
          {
            distance: 0.0099
          }
        ]
      }
    };

    confidenceScoreReverse(req, null, function() {
      t.equal(req.results.data[0].confidence, 0.9, 'score should be excellent confidence');
      t.equal(req.results.data[1].confidence, 0.9, 'score should be excellent confidence');
      t.end();
    });

  });

  test('10m <= distance < 100m should be given score 0.8', function(t) {
    var req = {
      results: {
        data: [
          {
            distance: 0.010
          },
          {
            distance: 0.099
          }
        ]
      }
    };

    confidenceScoreReverse(req, null, function() {
      t.equal(req.results.data[0].confidence, 0.8, 'score should be good confidence');
      t.equal(req.results.data[1].confidence, 0.8, 'score should be good confidence');
      t.end();
    });

  });

  test('100m <= distance < 250m should be given score 0.7', function(t) {
    var req = {
      results: {
        data: [
          {
            distance: 0.100
          },
          {
            distance: 0.249
          }
        ]
      }
    };

    confidenceScoreReverse(req, null, function() {
      t.equal(req.results.data[0].confidence, 0.7, 'score should be okay confidence');
      t.equal(req.results.data[1].confidence, 0.7, 'score should be okay confidence');
      t.end();
    });

  });

  test('250m <= distance < 1000m should be given score 0.6', function(t) {
    var req = {
      results: {
        data: [
          {
            distance: 0.250
          },
          {
            distance: 0.999
          }
        ]
      }
    };

    confidenceScoreReverse(req, null, function() {
      t.equal(req.results.data[0].confidence, 0.6, 'score should be poor confidence');
      t.equal(req.results.data[1].confidence, 0.6, 'score should be poor confidence');
      t.end();
    });

  });

  test('distance >= 1000m should be given score 0.5', function(t) {
    var req = {
      results: {
        data: [
          {
            distance: 1
          },
          {
            distance: 2
          }
        ]
      }
    };

    confidenceScoreReverse(req, null, function() {
      t.equal(req.results.data[0].confidence, 0.5, 'score should be least confidence');
      t.equal(req.results.data[1].confidence, 0.5, 'score should be least confidence');
      t.end();
    });

  });

  test('distance < 0 (invalid) should be given score 0.0', function(t) {
    var req = {
      results: {
        data: [
          {
            distance: -0.0001
          }
        ]
      }
    };

    confidenceScoreReverse(req, null, function() {
      t.equal(req.results.data[0].confidence, 0.0, 'score should be 0.0 confidence');
      t.end();
    });

  });

  test('non-number-type (invalid) distance should be given score 0.0', function(t) {
    var req = {
      results: {
        data: [
          {},
          { distance: [] },
          { distance: {} },
          { distance: 'this is not a number' }
        ]
      }
    };

    confidenceScoreReverse(req, null, function() {
      t.equal(req.results.data[0].confidence, 0.0, 'score should be 0.0 confidence');
      t.equal(req.results.data[1].confidence, 0.0, 'score should be 0.0 confidence');
      t.equal(req.results.data[2].confidence, 0.0, 'score should be 0.0 confidence');
      t.equal(req.results.data[3].confidence, 0.0, 'score should be 0.0 confidence');
      t.end();
    });

  });

};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('[middleware] confidenceScoreReverse: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
