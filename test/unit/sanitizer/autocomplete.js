const proxyquire =  require('proxyquire').noCallThru();
const _ = require('lodash');

module.exports.tests = {};

module.exports.tests.sanitizers = function(test, common) {
  test('verify that all sanitizers were called as expected', function(t) {
    var called_sanitizers = [];

    var autocomplete = proxyquire('../../../sanitizer/autocomplete', {
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
      '../sanitizer/_text_pelias_parser': function () {
        return {
          sanitize: () => {
            called_sanitizers.push('_text_pelias_parser');
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
      '../sanitizer/_address_layer_filter': function () {
        return {
          sanitize: () => {
            called_sanitizers.push('_address_layer_filter');
            return { errors: [], warnings: [] };
          }
        };
      },
      '../sanitizer/_tokenizer': function () {
        return {
          sanitize: () => {
            called_sanitizers.push('_tokenizer');
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
      '../sanitizer/_location_bias': function (defaultParameters) {
        return {
          sanitize: () => {
            if (defaultParameters.key === 'value'){
                called_sanitizers.push('_location_bias');
                return { errors: [], warnings: [] };
            } else {
                throw new Error('incorrect parameter passed to _location_bias');
            }
          }
        };
      },
      '../sanitizer/_geo_autocomplete': function () {
        return {
          sanitize: () => {
            called_sanitizers.push('_geo_autocomplete');
            return { errors: [], warnings: [] };
          }
        };
      },
      '../sanitizer/_boundary_country': function () {
        return {
          sanitize: () => {
            called_sanitizers.push('_boundary_country');
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
      '../sanitizer/_boundary_gid': () => {
        return {
          sanitize: () => {
            called_sanitizers.push('_boundary_gid');
            return { errors: [], warnings: [] };
          }
        };
      }
    });

    const expected_sanitizers = [
      '_single_scalar_parameters',
      '_debug',
      '_text_pelias_parser',
      '_size',
      '_targets/layers',
      '_targets/sources',
      '_address_layer_filter',
      '_tokenizer',
      '_sources_and_layers',
      '_flag_bool',
      '_location_bias',
      '_geo_autocomplete',
      '_boundary_country',
      '_categories',
      '_request_language',
      '_boundary_gid'
    ];

    const req = {};
    const res = {};

    const middleware = autocomplete.middleware({
      defaultParameters: {
        key: 'value'
      }
    });

    middleware(req, res, () => {
      t.deepEquals(called_sanitizers, expected_sanitizers);
      t.end();
    });

  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('SANITIZE /autocomplete ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
