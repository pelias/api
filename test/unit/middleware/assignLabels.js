var proxyquire =  require('proxyquire').noCallThru();

module.exports.tests = {};

module.exports.tests.serialization = function(test, common) {
  test('undefined res should not throw an exception', function(t) {
    var assignLabels = require('../../../middleware/assignLabels')(function(){});

    function testIt() {
      assignLabels(undefined, {}, function() {});
    }

    t.doesNotThrow(testIt, 'an exception should not have been thrown');
    t.end();

  });

  test('res without data should not throw an exception', function(t) {
    var assignLabels = require('../../../middleware/assignLabels')(function(){});

    function testIt() {
      assignLabels({}, {}, function() {});
    }

    t.doesNotThrow(testIt, 'an exception should not have been thrown');
    t.end();

  });

  test('labels should be assigned to all results', function(t) {
    var labelGenerator = function(result) {
      if (result.id === 1) {
        return 'label 1';
      }
      if (result.id === 2) {
        return 'label 2';
      }

    };

    var assignLabels = require('../../../middleware/assignLabels')(labelGenerator);

    var input = {
      data: [
        {
          id: 1
        },
        {
          id: 2
        }
      ]
    };

    var expected = {
      data: [
        {
          id: 1,
          label: 'label 1'
        },
        {
          id: 2,
          label: 'label 2'
        }
      ]
    };

    assignLabels({}, input, function () {
      t.deepEqual(input, expected);
      t.end();
    });

  });

  test('no explicit labelGenerator supplied should use pelias-labels module', function(t) {
    var assignLabels = proxyquire('../../../middleware/assignLabels', {
      'pelias-labels': function(result) {
        if (result.id === 1) {
          return 'label 1';
        }
      }
    })();

    var input = {
      data: [
        {
          id: 1
        }
      ]
    };

    var expected = {
      data: [
        {
          id: 1,
          label: 'label 1'
        }
      ]
    };

    assignLabels({}, input, function () {
      t.deepEqual(input, expected);
      t.end();
    });

  });

};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('[middleware] assignLabels: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
