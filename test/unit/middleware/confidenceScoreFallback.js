var confidenceScore = require('../../../middleware/confidenceScoreFallback')();

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
        scores: [10],
        query_type: 'original'
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
      meta: {
        scores: [10],
        query_type: 'fallback'
      }
    };

    confidenceScore(req, res, function() {});
    t.equal(res.data[0].confidence, 0.1, 'score was set');
    t.equal(res.data[0].match_type, 'unknown', 'exact match indicated');
    t.end();
  });

  test('no fallback addresses should have max score', function(t) {
    var req = {
      clean: {
        text: '123 Main St, City, NM',
        parsed_text: {
          number: 123,
          street: 'Main St',
          city: 'City',
          state: 'NM'
        }
      }
    };
    var res = {
      data: [{
        _score: 10,
        found: true,
        value: 1,
        layer: 'address',
        center_point: { lat: 100.1, lon: -50.5 },
        name: { default: 'test name1' },
        parent: {
          country: ['country1'],
          region: ['region1'],
          county: ['city1']
        }
      }],
      meta: {
        scores: [10],
        query_type: 'fallback'
      }
    };

    confidenceScore(req, res, function() {});
    t.equal(res.data[0].confidence, 1.0, 'max score was set');
    t.equal(res.data[0].match_type, 'exact', 'exact match indicated');
    t.end();
  });

  test('no fallback street query should have max score', function(t) {
    var req = {
      clean: {
        text: 'Main St, City, NM',
        parsed_text: {
          street: 'Main St',
          state: 'NM'
        }
      }
    };
    var res = {
      data: [{
        _score: 10,
        found: true,
        value: 1,
        layer: 'street',
        center_point: { lat: 100.1, lon: -50.5 },
        name: { default: 'test name1' },
        parent: {
          country: ['country1'],
          region: ['region1'],
          county: ['city1']
        }
      }],
      meta: {
        scores: [10],
        query_type: 'fallback'
      }
    };

    confidenceScore(req, res, function() {});
    t.equal(res.data[0].confidence, 1.0, 'max score was set');
    t.equal(res.data[0].match_type, 'exact', 'exact match indicated');
    t.end();
  });

  test('no fallback state query should have max score', function(t) {
    var req = {
      clean: {
        text: 'Region Name, Country',
        parsed_text: {
          state: 'Region Name',
          country: 'Country'
        }
      }
    };
    var res = {
      data: [{
        _score: 10,
        found: true,
        value: 1,
        layer: 'region',
        center_point: { lat: 100.1, lon: -50.5 },
        name: { default: 'Region Name' },
        parent: {
          country: ['country1']
        }
      }],
      meta: {
        scores: [10],
        query_type: 'fallback'
      }
    };

    confidenceScore(req, res, function() {});
    t.equal(res.data[0].confidence, 1.0, 'max score was set');
    t.equal(res.data[0].match_type, 'exact', 'exact match indicated');
    t.end();
  });

  test('no fallback country query should have max score', function(t) {
    var req = {
      clean: {
        text: 'Country Name',
        parsed_text: {
          country: 'Country Name'
        }
      }
    };
    var res = {
      data: [{
        _score: 10,
        found: true,
        value: 1,
        layer: 'country',
        center_point: { lat: 100.1, lon: -50.5 },
        name: { default: 'test name1' },
        parent: {
          country: ['country1']
        }
      }],
      meta: {
        scores: [10],
        query_type: 'fallback'
      }
    };

    confidenceScore(req, res, function() {});
    t.equal(res.data[0].confidence, 1.0, 'max score was set');
    t.equal(res.data[0].match_type, 'exact', 'exact match indicated');
    t.end();
  });

  test('fallback to locality when searching for address should have score deduction', function(t) {
    var req = {
      clean: {
        text: '123 Main St, City, NM',
        parsed_text: {
          number: 123,
          street: 'Main St',
          state: 'NM'
        }
      }
    };
    var res = {
      data: [{
        _score: 10,
        found: true,
        value: 1,
        layer: 'locality',
        center_point: { lat: 100.1, lon: -50.5 },
        name: { default: 'test name1' },
        parent: {
          country: ['country1']
        }
      }],
      meta: {
        scores: [10],
        query_type: 'fallback'
      }
    };

    confidenceScore(req, res, function() {});
    t.equal(res.data[0].confidence, 0.6, 'score was set');
    t.equal(res.data[0].match_type, 'fallback', 'fallback match indicated');
    t.end();
  });

  test('fallback to localadmin should have score deduction', function(t) {
    var req = {
      clean: {
        text: '123 Main St, City, NM',
        parsed_text: {
          number: 123,
          street: 'Main St',
          state: 'NM'
        }
      }
    };
    var res = {
      data: [{
        _score: 10,
        found: true,
        value: 1,
        layer: 'localadmin',
        center_point: { lat: 100.1, lon: -50.5 },
        name: { default: 'test name1' },
        parent: {
          country: ['country1']
        }
      }],
      meta: {
        scores: [10],
        query_type: 'fallback'
      }
    };

    confidenceScore(req, res, function() {});
    t.equal(res.data[0].confidence, 0.6, 'score was set');
    t.equal(res.data[0].match_type, 'fallback', 'fallback match indicated');
    t.end();
  });

  test('fallback to country should have score deduction', function(t) {
    var req = {
      clean: {
        text: '123 Main St, City, NM, USA',
        parsed_text: {
          number: 123,
          street: 'Main St',
          state: 'NM',
          country: 'USA'
        }
      }
    };
    var res = {
      data: [{
        _score: 10,
        found: true,
        value: 1,
        layer: 'country',
        center_point: { lat: 100.1, lon: -50.5 },
        name: { default: 'test name1' },
        parent: {
          country: ['country1']
        }
      }],
      meta: {
        scores: [10],
        query_type: 'fallback'
      }
    };

    confidenceScore(req, res, function() {});
    t.equal(res.data[0].confidence, 0.1, 'score was set');
    t.equal(res.data[0].match_type, 'fallback', 'fallback match indicated');
    t.end();
  });

  test('city input granularity with locality result should set score to 1.0', function(t) {
    var req = {
      clean: {
        parsed_text: {
          city: 'city name',
          state: 'state name'
        }
      }
    };
    var res = {
      data: [{
        layer: 'locality'
      }],
      meta: {
        query_type: 'fallback'
      }
    };

    confidenceScore(req, res, function() {});
    t.equal(res.data[0].confidence, 1.0, 'score was set');
    t.equal(res.data[0].match_type, 'exact', 'exact match indicated');
    t.end();
  });

  test('city input granularity with localadmin result should set score to 1.0', function(t) {
    var req = {
      clean: {
        parsed_text: {
          city: 'city name',
          state: 'state name'
        }
      }
    };
    var res = {
      data: [{
        layer: 'localadmin'
      }],
      meta: {
        query_type: 'fallback'
      }
    };

    confidenceScore(req, res, function() {});
    t.equal(res.data[0].confidence, 1.0, 'score was set');
    t.equal(res.data[0].match_type, 'exact', 'exact match indicated');
    t.end();
  });

  test('city input granularity with region fallback should set score to 0.3', function(t) {
    var req = {
      clean: {
        parsed_text: {
          city: 'city name',
          state: 'state name'
        }
      }
    };
    var res = {
      data: [{
        layer: 'region'
      }],
      meta: {
        query_type: 'fallback'
      }
    };

    confidenceScore(req, res, function() {});
    t.equal(res.data[0].confidence, 0.3, 'score was set');
    t.equal(res.data[0].match_type, 'fallback', 'fallback match indicated');
    t.end();
  });

  test('city input granularity with country fallback should set score to 0.1', function(t) {
    var req = {
      clean: {
        parsed_text: {
          city: 'city name',
          state: 'state name',
          country: 'country name'
        }
      }
    };
    var res = {
      data: [{
        layer: 'country'
      }],
      meta: {
        query_type: 'fallback'
      }
    };

    confidenceScore(req, res, function() {});
    t.equal(res.data[0].confidence, 0.1, 'score was set');
    t.equal(res.data[0].match_type, 'fallback', 'fallback match indicated');
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
