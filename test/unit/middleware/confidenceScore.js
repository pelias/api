var customConfig = {
  languages : ['default', 'fi', 'sv'] // consider these name versions in confidence scoring
};

var confidenceScore = require('../../../middleware/confidenceScore')(customConfig);

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
      data: [{
        name: 'foo'
      }],
      meta: [10]
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
      data: [{
        name: {
          default: 'foo'
        }
      }],
      meta: {
        scores: [10]
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
    };

    confidenceScore(req, res, function() {});
    t.equal(res.data[0].confidence, 0.6, 'score was set');
    t.end();
  });

  test('internationalization should not throw exception', function(t) {
    var req = {
      clean: { text: 'fabriksgatan' }
    };
    var res = {
      data: [{
        _score: 10,
        found: true,
        value: 1,
        center_point: { lat: 100.1, lon: -50.5 },
        name: { default: 'factory street', fi: 'tehtaankatu', sv: 'fabriksgatan' }, // match in sv
        parent: {
          country: ['country1'],
          region: ['state1'],
          county: ['city1']
        }
      }, {
        _score: 10,
        value: 2,
        center_point: { lat: 100.2, lon: -51.5 },
	name: { default: 'factory street', fi: 'tehtaankatu',
		sv: 'wrong name here', ignore: 'fabriksgatan' }, // match in ignore
        parent: {
          country: ['country2'],
          region: ['state2'],
          county: ['city2']
        }
      }],
      meta: {scores: [10]}
    };

    confidenceScore(req, res, function() {});
    t.equal(res.data[0].confidence, 0.6, 'Internationalized name contributed in scoring');
    t.equal(res.data[1].confidence, 0.54, 'Do not consider name versions excluded from configuration');

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
