var proxyquire =  require('proxyquire').noCallThru();
const _ = require('lodash');

module.exports.tests = {};

module.exports.tests.sanitize = function(test, common) {
  test('verify that all sanitizers were called as expected', function(t) {
    var called_sanitizers = [];

    // rather than re-verify the functionality of all the sanitizers, this test just verifies that they
    //  were all called correctly
    var search = proxyquire('../../../sanitizer/structured_geocoding', {
      '../sanitizer/_default_parameters': function (defaultParameters) {
        return {
          sanitize: () => {
            if (defaultParameters.key === 'value') {
              called_sanitizers.push('_default_parameters');
              return { errors: [], warnings: [] };
            } else {
              throw new Error('incorrect parameter passed to _default_parameters');
            }
          }
        };
      },
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
      '../sanitizer/_synthesize_analysis': function () {
        return {
          sanitize: () => {
            called_sanitizers.push('_synthesize_analysis');
            return { errors: [], warnings: [] };
          }
        };
      },
      '../sanitizer/_iso2_to_iso3': function () {
        return {
          sanitize: () => {
            called_sanitizers.push('_iso2_to_iso3');
            return { errors: [], warnings: [] };
          }
        };
      },
      '../sanitizer/_city_name_standardizer': function () {
        return {
          sanitize: () => {
            called_sanitizers.push('_city_name_standardizer');
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
      '../sanitizer/_geo_search': function () {
        return {
          sanitize: () => {
            called_sanitizers.push('_geo_search');
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
      },
      '../sanitizer/_gids': (key) => {
        return {
          sanitize: () => {
            called_sanitizers.push(`_${key}_gid`);
            return { errors: [], warnings: [] };
          }
        };
      }
    });

    var expected_sanitizers = [
      '_default_parameters',
      '_single_scalar_parameters',
      '_debug',
      '_synthesize_analysis',
      '_iso2_to_iso3',
      '_city_name_standardizer',
      '_size',
      '_targets/layers',
      '_targets/sources',
      '_sources_and_layers',
      '_flag_bool',
      '_geo_search',
      '_boundary_country',
      '_categories',
      '_request_language',
      '_boundary_gid'
    ];

    var req = {};
    var res = {};

    const middleware = search.middleware({
      defaultParameters: {
        key: 'value'
      }
    });

    middleware(req, res, function(){
      t.deepEquals(called_sanitizers, expected_sanitizers);
      t.end();
    });

  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('SANITIZE /structured ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
