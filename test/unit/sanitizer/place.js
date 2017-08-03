const  _ = require('lodash'),
    proxyquire =  require('proxyquire').noCallThru();

module.exports.tests = {};

module.exports.tests.sanitize = function(test, common) {
  test('verify that all sanitizers were called as expected', function(t) {
    var called_sanitizers = [];

    // rather than re-verify the functionality of all the sanitizers, this test just verifies that they
    //  were all called correctly
    var place = proxyquire('../../../sanitizer/place.js', {
      '../sanitizer/_single_scalar_parameters': function () {
        return {
          sanitize: () => {
            called_sanitizers.push('_single_scalar_parameters');
            return { errors: [], warnings: [] };
          }
        };
      },
      '../sanitizer/_debug': () => {
        return {
          sanitize: () => {
            called_sanitizers.push('_debug');
            return { errors: [], warnings: [] };
          }
        };
      },
      '../sanitizer/_ids': function () {
        return {
          sanitize: () => {
            called_sanitizers.push('_ids');
            return { errors: [], warnings: [] };
          }
        };
      },
      '../sanitizer/_flag_bool': function () {
        if (arguments[0] === 'private' && arguments[1] === false) {
          return {
            sanitize: () => {
                called_sanitizers.push('_flag_bool');
                return { errors: [], warnings: [] };
              }
            };
        } else {
            throw new Error('incorrect parameters passed to _flag_bool');
        }
      }
    });

    const expected_sanitizers = [
      '_single_scalar_parameters',
      '_debug',
      '_ids',
      '_flag_bool'
    ];

    const req = {};
    const res = {};

    place.middleware(req, res, () => {
      t.deepEquals(called_sanitizers, expected_sanitizers);
      t.end();
    });
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('SANITIZE /place ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
