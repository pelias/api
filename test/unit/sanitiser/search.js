var proxyquire =  require('proxyquire').noCallThru();

module.exports.tests = {};

module.exports.tests.sanitize = function(test, common) {
  test('verify that all sanitisers were called as expected', function(t) {
    var called_sanitisers = [];

    // rather than re-verify the functionality of all the sanitisers, this test just verifies that they
    //  were all called correctly
    var search = proxyquire('../../../sanitiser/search', {
      '../sanitiser/_deprecate_quattroshapes': function() {
        called_sanitisers.push('_deprecate_quattroshapes');
        return { errors: [], warnings: [] };
      },
      '../sanitiser/_single_scalar_parameters': function() {
        called_sanitisers.push('_single_scalar_parameters');
        return { errors: [], warnings: [] };
      },
      '../sanitiser/_text': function() {
        called_sanitisers.push('_text');
        return { errors: [], warnings: [] };
      },
      '../sanitiser/_size': function() {
        if (arguments.length === 0) {
          return function() {
            called_sanitisers.push('_size');
            return { errors: [], warnings: [] };
          };

        } else {
          throw new Error('should not have passed any parameters to _size');
        }

      },
      '../sanitiser/_targets': function(type) {
        if (['layers', 'sources'].indexOf(type) !== -1) {
          return function() {
            called_sanitisers.push('_targets/' + type);
            return { errors: [], warnings: [] };
          };

        }
        else {
          throw new Error('incorrect parameters passed to _targets');
        }

      },
      '../sanitiser/_sources_and_layers': function() {
        called_sanitisers.push('_sources_and_layers');
        return { errors: [], warnings: [] };
      },
      '../sanitiser/_flag_bool': function() {
        if (arguments[0] === 'private' && arguments[1] === false) {
          return function() {
            called_sanitisers.push('_flag_bool');
            return { errors: [], warnings: [] };
          };

        }
        else {
          throw new Error('incorrect parameters passed to _flag_bool');
        }

      },
      '../sanitiser/_geo_search': function() {
        called_sanitisers.push('_geo_search');
        return { errors: [], warnings: [] };
      },
      '../sanitiser/_boundary_country': function() {
        called_sanitisers.push('_boundary_country');
        return { errors: [], warnings: [] };
      },
      '../sanitiser/_categories': function() {
        called_sanitisers.push('_categories');
        return { errors: [], warnings: [] };
      },
    });

    var expected_sanitisers = [
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
      t.deepEquals(called_sanitisers, expected_sanitisers);
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
