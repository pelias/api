const proxyquire =  require('proxyquire').noCallThru();
const _ = require('lodash');

module.exports.tests = {};

module.exports.tests.sanitize = (test, common) => {
  test('verify that all sanitizers were called as expected', (t) => {
    const called_sanitizers = [];

    // rather than re-verify the functionality of all the sanitizers, this test just verifies that they
    //  were all called correctly
    const search = proxyquire('../../../sanitizer/search', {
      '../sanitizer/_deprecate_quattroshapes': () => {
        called_sanitizers.push('_deprecate_quattroshapes');
        return { errors: [], warnings: [] };
      },
      '../sanitizer/_single_scalar_parameters': () => {
        called_sanitizers.push('_single_scalar_parameters');
        return { errors: [], warnings: [] };
      },
      '../sanitizer/_text': () => {
        called_sanitizers.push('_text');
        return { errors: [], warnings: [] };
      },
      '../sanitizer/_iso2_to_iso3': () => {
        called_sanitizers.push('_iso2_to_iso3');
        return { errors: [], warnings: [] };
      },
      '../sanitizer/_city_name_standardizer': () => {
        called_sanitizers.push('_city_name_standardizer');
        return { errors: [], warnings: [] };
      },
      '../sanitizer/_size': function() {
        if (_.isEmpty(arguments)) {
          return () => {
            called_sanitizers.push('_size');
            return { errors: [], warnings: [] };
          };

        } else {
          throw new Error('should not have passed any parameters to _size');
        }

      },
      '../sanitizer/_targets': (type) => {
        if (['layers', 'sources'].indexOf(type) !== -1) {
          return () => {
            called_sanitizers.push(`_targets/${type}`);
            return { errors: [], warnings: [] };
          };

        }
        else {
          throw new Error('incorrect parameters passed to _targets');
        }

      },
      '../sanitizer/_sources_and_layers': () => {
        called_sanitizers.push('_sources_and_layers');
        return { errors: [], warnings: [] };
      },
      '../sanitizer/_flag_bool': function() {
        if (arguments[0] === 'private' && arguments[1] === false) {
          return () => {
            called_sanitizers.push('_flag_bool');
            return { errors: [], warnings: [] };
          };

        }
        else {
          throw new Error('incorrect parameters passed to _flag_bool');
        }

      },
      '../sanitizer/_geo_search': () => {
        called_sanitizers.push('_geo_search');
        return { errors: [], warnings: [] };
      },
      '../sanitizer/_boundary_country': () => {
        called_sanitizers.push('_boundary_country');
        return { errors: [], warnings: [] };
      },
      '../sanitizer/_categories': () => {
        called_sanitizers.push('_categories');
        return { errors: [], warnings: [] };
      },
        '../sanitizer/_geonames_warnings': () => {
        called_sanitizers.push('_geonames_warnings');
        return { errors: [], warnings: [] };
      }
    });

    const expected_sanitizers = [
      '_single_scalar_parameters',
      '_deprecate_quattroshapes',
      '_text',
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
      '_geonames_warnings'
    ];

    const req = {};
    const res = {};

    search.middleware(req, res, () => {
      t.deepEquals(called_sanitizers, expected_sanitizers);
      t.end();
    });
  });
};

module.exports.all = (tape, common) => {

  function test(name, testFunction) {
    return tape(`SANTIZE /search ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
