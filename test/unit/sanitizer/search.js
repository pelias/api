var proxyquire =  require('proxyquire').noCallThru();

module.exports.tests = {};

module.exports.tests.sanitize = function(test, common) {
  test('verify that all sanitizers were called as expected', function(t) {
    var called_sanitizers = [];

    // rather than re-verify the functionality of all the sanitizers, this test just verifies that they
    //  were all called correctly
    var search = proxyquire('../../../sanitizer/search', {
      '../sanitizer/_deprecate_quattroshapes': function() {
        called_sanitizers.push('_deprecate_quattroshapes');
        return { errors: [], warnings: [] };
      },
      '../sanitizer/_single_scalar_parameters': function() {
        called_sanitizers.push('_single_scalar_parameters');
        return { errors: [], warnings: [] };
      },
      '../sanitizer/_text': function() {
        called_sanitizers.push('_text');
        return { errors: [], warnings: [] };
      },
      '../sanitizer/_size': function() {
        if (arguments.length === 0) {
          return function() {
            called_sanitizers.push('_size');
            return { errors: [], warnings: [] };
          };

        } else {
          throw new Error('should not have passed any parameters to _size');
        }

      },
      '../sanitizer/_targets': function(type) {
        if (['layers', 'sources'].indexOf(type) !== -1) {
          return function() {
            called_sanitizers.push('_targets/' + type);
            return { errors: [], warnings: [] };
          };

        }
        else {
          throw new Error('incorrect parameters passed to _targets');
        }

      },
      '../sanitizer/_sources_and_layers': function() {
        called_sanitizers.push('_sources_and_layers');
        return { errors: [], warnings: [] };
      },
      '../sanitizer/_flag_bool': function() {
        if (arguments[0] === 'private' && arguments[1] === false) {
          return function() {
            called_sanitizers.push('_flag_bool');
            return { errors: [], warnings: [] };
          };

        }
        else {
          throw new Error('incorrect parameters passed to _flag_bool');
        }

      },
      '../sanitizer/_geo_search': function() {
        called_sanitizers.push('_geo_search');
        return { errors: [], warnings: [] };
      },
      '../sanitizer/_boundary_country': function() {
        called_sanitizers.push('_boundary_country');
        return { errors: [], warnings: [] };
      },
      '../sanitizer/_categories': function() {
        called_sanitizers.push('_categories');
        return { errors: [], warnings: [] };
      },
    });

    var expected_sanitizers = [
      '_deprecate_quattroshapes',
      '_single_scalar_parameters',
      '_text',
      '_size',
      '_targets/layers',
      '_targets/sources',
      '_sources_and_layers',
      '_flag_bool',
      '_geo_search',
      '_boundary_country',
      '_categories'
    ];

    var req = {};
    var res = {};

    search.middleware(req, res, function(){
      t.deepEquals(called_sanitizers, expected_sanitizers);
      t.end();
    });
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('SANTIZE /search ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
