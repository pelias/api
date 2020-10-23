const applyOverrides = require('../../../middleware/applyOverrides')();
const codec = require('pelias-model').codec;

const proxyquire = require('proxyquire').noCallThru();

module.exports.tests = {};

module.exports.tests.applyOverrides = function(test, common) {
  test('valid override data with no other addendum', function(t) {
    const res = {
      data: [
        {
            name: 'aliased name to throw out',
            addendum: {
                override: codec.encode({ name: 'Override Name' }),
            }
        }
      ]
    };

    const expected = {
      data: [
        {
          name: 'Override Name'
        }
      ]
    };

    applyOverrides({}, res, function () {
      t.deepEquals(res, expected, 'valid override data');
      t.end();
    });
  });

  test('valid override data with other addendum data', function(t) {
    const res = {
      data: [
        {
            name: 'aliased name to throw out',
            addendum: {
                override: codec.encode({ name: 'Override Name' }),
                other_data: 1234
            }
        }
      ]
    };

    const expected = {
      data: [
        {
          name: 'Override Name',
          addendum: {
              other_data: 1234
          }
        }
      ]
    };

    applyOverrides({}, res, function () {
      t.deepEquals(res, expected, 'valid override data');
      t.end();
    });
  });

  test('invalid override data', function(t) {
    const res = {
      data: [
        {
            name: 'aliased name to throw out',
            addendum: {
                override: 'garbage json'
            }
        }
      ]
    };

    const expected = {
      data: [
        {
          name: 'aliased name to throw out'
        }
      ]
    };

    const proxiedApplyOverrides = proxyquire('../../../middleware/applyOverrides', {
        'pelias-logger': {
          get: () => {
            return {
              error: (msg1, msg2) => {
                t.equals(msg1, 'Invalid addendum override json string:');
                t.deepEquals(msg2, { override: 'garbage json' });
              }
            };
  
          }
        }
      })();

      proxiedApplyOverrides({}, res, function () {
      t.deepEquals(res, expected, 'invalid override data');
      t.end();
    });
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('[middleware] applyOverrides: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
