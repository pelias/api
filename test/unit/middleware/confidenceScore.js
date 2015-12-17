var confidenceScore = require('../../../middleware/confidenceScore')();

module.exports.tests = {};

module.exports.tests.confidenceScore = function(test, common) {

  test('empty res and req should not throw exception', function(t) {
    try {
      confidenceScore({}, {}, function() {});
      t.pass('no exception');
    }
    catch (e) {
      t.fail('an exception should not have been thrown');
    }
    finally {
      t.end();
    }

  });

  test('res.results without parsed_text should not throw exception', function(t) {
    var req = {};
    var res = {
      data: [{
        name: 'foo'
      }],
      meta: [10]
    };

    try {
      confidenceScore(req, res, function() {});
      t.pass('no exception');
    }
    catch (e) {
      t.fail('an exception should not have been thrown');
      console.log(e.stack);
    }
    finally {
      t.end();
    }

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
      data: [{
        name: {
          default: 'foo'
        }
      }],
      meta: {
        scores: [10]
      }
    };

    try {
      confidenceScore(req, res, function() {});
      t.pass('no exception');
    }
    catch (e) {
      t.fail('an exception should not have been thrown with no address');
      console.log(e.stack);
    }
    finally {
      t.end();
    }
  });


  test('res.results without parsed_text should not throw exception', function(t) {
    var req = {
      clean: { text: 'test name1' }
    };
    var res = {
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
      meta: {scores: [10]}
    };

    confidenceScore(req, res, function() {});
    t.equal(res.data[0].confidence, 0.6, 'score was set');
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
