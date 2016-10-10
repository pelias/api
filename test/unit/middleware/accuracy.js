var accuracy = require('../../../middleware/accuracy')();

module.exports.tests = {};

module.exports.tests.accuracy = function(test, common) {

  test('empty res and req should not throw exception', function(t) {
    function testIt() {
      accuracy({}, {}, function() {});
    }

    t.doesNotThrow(testIt, 'an exception should not have been thrown');
    t.end();
  });

  test('res.results without parsed_text should not throw exception', function(t) {
    var res = {
      data: [{
        layer: 'venue'
      }]
    };

    accuracy({}, res, function() {
      t.equal(res.data[0].accuracy, 'point', 'accuracy was set');
      t.end();
    });
  });

  test('venue should have accuracy set to point', function(t) {
    var res = {
      data: [{
        layer: 'venue'
      }]
    };

    accuracy({}, res, function() {
      t.equal(res.data[0].accuracy, 'point', 'accuracy was set');
      t.end();
    });
  });

  test('address should have accuracy set to point', function(t) {
    var res = {
      data: [{
        layer: 'address'
      }]
    };

    accuracy({}, res, function() {
      t.equal(res.data[0].accuracy, 'point', 'accuracy was set');
      t.end();
    });
  });

  test('region should have accuracy set to centroid', function(t) {
    var res = {
      data: [{
        layer: 'region'
      }]
    };

    accuracy({}, res, function() {
      t.equal(res.data[0].accuracy, 'centroid', 'accuracy was set');
      t.end();
    });
  });

  test('street should have accuracy set to centroid', function(t) {
    var res = {
      data: [{
        layer: 'street'
      }]
    };

    accuracy({}, res, function() {
      t.equal(res.data[0].accuracy, 'centroid', 'accuracy was set');
      t.end();
    });
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
