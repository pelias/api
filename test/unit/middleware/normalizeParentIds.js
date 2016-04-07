var normalizer = require('../../../middleware/normalizeParentIds')();

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('WOF ids converted to Pelias ids', function(t) {

    var input = {
      data: [{
        'parent': {
          'country': ['United States'], // these shouldn't change
          'country_id': ['85633793'],
          'country_a': ['USA']
        },
        'country': ['United States'],
        'country_gid': ['85633793'],
        'country_a': ['USA'],
        'macroregion': ['MacroRegion Name'],
        'macroregion_gid': ['foobar'],
        'macroregion_a': ['MacroRegion Abbreviation'],
        'region': ['New York'],
        'region_gid': ['85688543'],
        'region_a': ['NY'],
        'macrocounty': ['MacroCounty Name'],
        'macrocounty_gid': ['~~~~~'],
        'macrocounty_a': ['MacroCounty Abbreviation'],
        'county': ['Kings County'],
        'county_gid': ['102082361'],
        'county_a': [null],
        'localadmin': ['Brooklyn'],
        'localadmin_gid': ['404521211'],
        'localadmin_a': [null],
        'locality': ['Some Locality'],
        'locality_gid': ['85977539'],
        'locality_a': [null],
        'neighbourhood': [],
        'neighbourhood_gid': []
      }]
    };

    var expected = {
      data: [{
        'parent': {
          'country': ['United States'],
          'country_id': ['85633793'],
          'country_a': ['USA']
        },
        'country': ['United States'],
        'country_gid': ['whosonfirst:country:85633793'],
        'country_a': ['USA'],
        'macroregion': ['MacroRegion Name'],
        'macroregion_gid': ['whosonfirst:macroregion:foobar'],
        'macroregion_a': ['MacroRegion Abbreviation'],
        'region': ['New York'],
        'region_gid': ['whosonfirst:region:85688543'],
        'region_a': ['NY'],
        'macrocounty': ['MacroCounty Name'],
        'macrocounty_gid': ['whosonfirst:macrocounty:~~~~~'],
        'macrocounty_a': ['MacroCounty Abbreviation'],
        'county': ['Kings County'],
        'county_gid': ['whosonfirst:county:102082361'],
        'county_a': [null],
        'localadmin': ['Brooklyn'],
        'localadmin_gid': ['whosonfirst:localadmin:404521211'],
        'localadmin_a': [null],
        'locality': ['Some Locality'],
        'locality_gid': ['whosonfirst:locality:85977539'],
        'locality_a': [null],
        'neighbourhood': [],
        'neighbourhood_gid': []
      }]
    };

    normalizer({}, input, function () {
      t.deepEqual(input, expected);
      t.end();
    });

  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('[middleware] normalizeParentIds: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
