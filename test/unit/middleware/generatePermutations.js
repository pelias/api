var generatePermutations = require('../../../middleware/generatePermutations')();

module.exports.tests = {};

module.exports.tests.confidenceScore = function(test, common) {
  test('undefined req.clean should not throw exception', function(t) {
    var req = {};
    var res = {};
    var next_called = false;

    function testIt() {
      generatePermutations(req, res, function() { next_called = true; });
    }

    t.doesNotThrow(testIt, 'an exception should not have been thrown');
    t.ok(next_called);
    t.end();

  });

  test('undefined req.clean.parsed_text should not throw exception', function(t) {
    var req = {
      clean: {}
    };
    var res = {};
    var next_called = false;

    function testIt() {
      generatePermutations(req, res, function() { next_called = true; });
    }

    t.doesNotThrow(testIt, 'an exception should not have been thrown');
    t.ok(next_called);
    t.equal(req.clean.permutations, undefined);
    t.end();

  });

  test('empty req.clean.parsed_text should not throw exception', function(t) {
    var req = {
      clean: {
        parsed_text: {}
      }
    };
    var res = {};
    var next_called = false;

    function testIt() {
      generatePermutations(req, res, function() { next_called = true; });
    }

    t.doesNotThrow(testIt, 'an exception should not have been thrown');
    t.ok(next_called);
    t.equal(req.clean.permutations, undefined);
    t.end();

  });

  test('parsed_text with number should add permutations for less granular searches', function(t) {
    var req = {
      clean: {
        parsed_text: {
          number: '1234',
          street: 'street name',
          city: 'city name',
          state: 'state name'
        }
      }
    };
    var res = {};
    var next_called = false;

    function testIt() {
      generatePermutations(req, res, function() { next_called = true; });
    }

    var expected_permutations = [
      {
        number: '1234',
        street: 'street name',
        city: 'city name',
        state: 'state name'
      },
      {
        street: 'street name',
        city: 'city name',
        state: 'state name'
      },
      {
        city: 'city name',
        state: 'state name'
      },
      {
        state: 'state name'
      }
    ];

    testIt();

    t.deepEquals(req.clean.permutations, expected_permutations);
    t.ok(next_called);
    t.end();

  });

  //
  // test('empty res and req should not throw exception', function(t) {
  //   function testIt() {
  //     confidenceScore({}, {}, function() {});
  //   }
  //
  //   t.doesNotThrow(testIt, 'an exception should not have been thrown');
  //   t.end();
  // });
  //
  // test('res.results without parsed_text should not throw exception', function(t) {
  //   var req = {};
  //   var res = {
  //     data: [{
  //       name: 'foo'
  //     }],
  //     meta: [10]
  //   };
  //
  //   function testIt() {
  //     confidenceScore(req, res, function() {});
  //   }
  //
  //   t.doesNotThrow(testIt, 'an exception should not have been thrown');
  //   t.end();
  // });
  //
  // test('hit without address should not error', function(t) {
  //   var req = {
  //     clean: {
  //       text: 'test name3',
  //       parsed_text: {
  //         postalcode: 12345
  //       }
  //     }
  //   };
  //   var res = {
  //     data: [{
  //       name: {
  //         default: 'foo'
  //       }
  //     }],
  //     meta: {
  //       scores: [10]
  //     }
  //   };
  //
  //   function testIt() {
  //     confidenceScore(req, res, function() {});
  //   }
  //
  //   t.doesNotThrow(testIt, 'an exception should not have been thrown with no address');
  //   t.end();
  // });
  //
  //
  // test('res.results without parsed_text should not throw exception', function(t) {
  //   var req = {
  //     clean: { text: 'test name1' }
  //   };
  //   var res = {
  //     data: [{
  //       _score: 10,
  //       found: true,
  //       value: 1,
  //       center_point: { lat: 100.1, lon: -50.5 },
  //       name: { default: 'test name1' },
  //       parent: {
  //         country: ['country1'],
  //         region: ['state1'],
  //         county: ['city1']
  //       }
  //     }, {
  //       _score: 20,
  //       value: 2,
  //       center_point: { lat: 100.2, lon: -51.5 },
  //       name: { default: 'test name2' },
  //       parent: {
  //         country: ['country2'],
  //         region: ['state2'],
  //         county: ['city2']
  //       }
  //     }],
  //     meta: {scores: [10]}
  //   };
  //
  //   confidenceScore(req, res, function() {});
  //   t.equal(res.data[0].confidence, 0.6, 'score was set');
  //   t.end();
  // });

};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('[middleware] confidenceScore: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
