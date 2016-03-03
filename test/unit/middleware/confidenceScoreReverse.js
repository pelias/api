var confidenceScoreReverse = require('../../../middleware/confidenceScoreReverse')();

module.exports.tests = {};

module.exports.tests.confidenceScoreReverse = function(test, common) {
  test('res without results should not throw exception', function(t) {
    var res = {};

    function testIt() {
      confidenceScoreReverse(null, res, function() {});
    }

    t.doesNotThrow(testIt, 'an exception should not have been thrown');
    t.end();
  });

  test('res.results without data should not throw exception', function(t) {
    var res = {
      results: {}
    };

    function testIt() {
      confidenceScoreReverse(null, res, function() {});
    }

    t.doesNotThrow(testIt, 'an exception should not have been thrown');
    t.end();
  });

  test('0m <= distance < 1m should be given score 1.0', function(t) {
    var res = {
      data: [
        { distance: 0.0000 / 1000.0 },
        { distance: 0.9999 / 1000.0 }
      ]
    };

    confidenceScoreReverse(null, res, function() {
      t.equal(res.data[0].confidence, 1.0, 'score should be exact confidence');
      t.equal(res.data[1].confidence, 1.0, 'score should be exact confidence');
      t.end();
    });

  });

  test('1m <= distance < 10m should be given score 0.9', function(t) {
    var res = {
      data: [
        { distance: 1.0000 / 1000.0 },
        { distance: 9.9999 / 1000.0 }
      ]
    };

    confidenceScoreReverse(null, res, function() {
      t.equal(res.data[0].confidence, 0.9, 'score should be excellent confidence');
      t.equal(res.data[1].confidence, 0.9, 'score should be excellent confidence');
      t.end();
    });

  });

  test('10m <= distance < 100m should be given score 0.8', function(t) {
    var res = {
      data: [
        { distance: 10.0000 / 1000.0 },
        { distance: 99.9999 / 1000.0 }
      ]
    };

    confidenceScoreReverse(null, res, function() {
      t.equal(res.data[0].confidence, 0.8, 'score should be good confidence');
      t.equal(res.data[1].confidence, 0.8, 'score should be good confidence');
      t.end();
    });

  });

  test('100m <= distance < 250m should be given score 0.7', function(t) {
    var res = {
      data: [
        { distance: 100.0000 / 1000.0 },
        { distance: 249.9999 / 1000.0 }
      ]
    };

    confidenceScoreReverse(null, res, function() {
      t.equal(res.data[0].confidence, 0.7, 'score should be okay confidence');
      t.equal(res.data[1].confidence, 0.7, 'score should be okay confidence');
      t.end();
    });

  });

  test('250m <= distance < 1000m should be given score 0.6', function(t) {
    var res = {
      data: [
        {distance: 250.0000 / 1000.0},
        {distance: 999.9999 / 1000.0}
      ]
    };

    confidenceScoreReverse(null, res, function() {
      t.equal(res.data[0].confidence, 0.6, 'score should be poor confidence');
      t.equal(res.data[1].confidence, 0.6, 'score should be poor confidence');
      t.end();
    });

  });

  test('distance >= 1000m should be given score 0.5', function(t) {
    var res = {
      data: [
        {distance: 1000.0 / 1000.0},
        {distance: 2000.0 / 1000.0}
      ]
    };

    confidenceScoreReverse(null, res, function() {
      t.equal(res.data[0].confidence, 0.5, 'score should be least confidence');
      t.equal(res.data[1].confidence, 0.5, 'score should be least confidence');
      t.end();
    });

  });

  test('distance < 0 (invalid) should be given score 0.0', function(t) {
    var res = {
      data: [
        { distance: -1.0000 / 1000.0 }
      ]
    };

    confidenceScoreReverse(null, res, function() {
      t.equal(res.data[0].confidence, 0.0, 'score should be 0.0 confidence');
      t.end();
    });

  });

  test('non-number-type (invalid) distance should be given score 0.0', function(t) {
    var res = {
      data: [
        {},
        {distance: []},
        {distance: {}},
        {distance: 'this is not a number'}
      ]
    };

    confidenceScoreReverse(null, res, function() {
      t.equal(res.data[0].confidence, 0.0, 'score should be 0.0 confidence');
      t.equal(res.data[1].confidence, 0.0, 'score should be 0.0 confidence');
      t.equal(res.data[2].confidence, 0.0, 'score should be 0.0 confidence');
      t.equal(res.data[3].confidence, 0.0, 'score should be 0.0 confidence');
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
