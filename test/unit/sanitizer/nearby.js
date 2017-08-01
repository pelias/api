const  _ = require('lodash'),
    proxyquire =  require('proxyquire').noCallThru();

module.exports.tests = {};

module.exports.tests.sanitize = function(test, common) {
  test('verify that all sanitizers were called as expected', function(t) {
    var called_sanitizers = [];

    // rather than re-verify the functionality of all the sanitizers, this test just verifies that they
    //  were all called correctly
    var nearby = proxyquire('../../../sanitizer/nearby.js', {
      '../sanitizer/_categories': function () {
        return {
          sanitize: () => {
            called_sanitizers.push('_categories');
            return { errors: [], warnings: [] };
          }
        };
      }
    });

    const expected_sanitizers = [
      '_categories'
    ];

    const req = {};
    const res = {};

    nearby.middleware(req, res, () => {
      t.deepEquals(called_sanitizers, expected_sanitizers);
      t.end();
    });
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('SANITIZE /nearby ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
