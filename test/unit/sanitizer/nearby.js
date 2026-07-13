const  _ = require('lodash'),
    proxyquire =  require('proxyquire').noCallThru();

module.exports.tests = {};

module.exports.tests.sanitize = function(test, common) {
  test('verify that all sanitizers were called as expected', function(t) {
    var called_sanitizers = [];

    // rather than re-verify the functionality of all the sanitizers, this test just verifies that they
    //  were all called correctly
    var nearby = proxyquire('../../../sanitizer/nearby.js', {
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
      '../sanitizer/_targets': function (type) {
        if (['layers', 'sources'].indexOf(type) !== -1) {
          return {
            sanitize: () => {
              called_sanitizers.push(`_targets/${type}`);
              return { errors: [], warnings: [] };
              }
            };
          } else {
          throw new Error('incorrect parameters passed to _targets');
        }
      },
      '../sanitizer/_sources_and_layers': function () {
        return {
          sanitize: () => {
            called_sanitizers.push('_sources_and_layers');
            return { errors: [], warnings: [] };
          }
        };
      },
      '../sanitizer/_geonames_deprecation': function () {
        return {
          sanitize: () => {
            called_sanitizers.push('_geonames_deprecations');
            return { errors: [], warnings: [] };
          }
        };
      },
      '../sanitizer/_size': function () {
        if (_.isEmpty(arguments)) {
          return {
            sanitize: () => {
              called_sanitizers.push('_size');
              return { errors: [], warnings: [] };
              }
          };
        } else {
          throw new Error('should not have passed any parameters to _size');
        }
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
      },
      '../sanitizer/_geo_reverse': function () {
        return {
          sanitize: () => {
            called_sanitizers.push('_geo_reverse');
            return { errors: [], warnings: [] };
          }
        };
      },
      '../sanitizer/_countries': function (key) {
        return {
          sanitize: () => {
            called_sanitizers.push(`_${key}_country`);
            return { errors: [], warnings: [] };
          }
        };
      },
      '../sanitizer/_categories': function () {
        return {
          sanitize: () => {
            called_sanitizers.push('_categories');
            return { errors: [], warnings: [] };
          }
        };
      },
      '../sanitizer/_request_language': () => {
        return {
          sanitize: () => {
            called_sanitizers.push('_request_language');
            return { errors: [], warnings: [] };
          }
        };
      }
    });

    const expected_sanitizers = [
      '_single_scalar_parameters',
      '_debug',
      '_targets/layers',
      '_targets/sources',
      '_sources_and_layers',
      '_geonames_deprecations',
      '_size',
      '_flag_bool',
      '_geo_reverse',
      '_boundary_country',
      '_categories',
      '_request_language'
    ];

    const req = {};
    const res = {};

    nearby.middleware({})(req, res, () => {
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
