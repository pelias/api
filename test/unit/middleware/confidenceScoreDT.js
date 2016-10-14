var customConfig = {
  languages : ['default', 'fi', 'sv'] // consider these name versions in confidence scoring
};

var confidenceScore = require('../../../middleware/confidenceScoreDT')(customConfig);

module.exports.tests = {};

module.exports.tests.confidenceScore = function(test, common) {

  test('internationalization should not throw exception', function(t) {
    var req = {
      clean: { text: 'fabriksgatan' }
    };
    var res = {
      data: [{
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
    t.equal(res.data[0].confidence, 1, 'Internationalized name contributed in scoring');
    t.equal(res.data[1].confidence, 0.1, 'Do not consider name versions excluded from configuration');

    t.end();
  });

  test('sort results by confidence score', function(t) {
    var req = {
      clean: { text: 'rank me first' }
    };
    var res = {
      data: [{
        value: 1,
        center_point: { lat: 100.1, lon: -50.5 },
        name: { default: 'rank me second' },
      }, {
        value: 2,
        center_point: { lat: 100.2, lon: -51.5 },
        name: { default: 'rank me first' }, // better match here
      }],
      meta: {scores: [10]}
    };

    confidenceScore(req, res, function() {});
    t.equal(res.data[0].name.default, 'rank me first', 'results are sorted by confidence score');
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
