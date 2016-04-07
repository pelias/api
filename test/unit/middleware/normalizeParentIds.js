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
        'country_id': ['85633793'],
        'country_a': ['USA'],
        'macroregion': ['MacroRegion Name'],
        'macroregion_id': ['foobar'],
        'macroregion_a': ['MacroRegion Abbreviation'],
        'region': ['New York'],
        'region_id': ['85688543'],
        'region_a': ['NY'],
        'macrocounty': ['MacroCounty Name'],
        'macrocounty_id': ['~~~~~'],
        'macrocounty_a': ['MacroCounty Abbreviation'],
        'county': ['Kings County'],
        'county_id': ['102082361'],
        'county_a': [null],
        'localadmin': ['Brooklyn'],
        'localadmin_id': ['404521211'],
        'localadmin_a': [null],
        'locality': ['Some Locality'],
        'locality_id': ['85977539'],
        'locality_a': [null],
        'neighbourhood': [],
        'neighbourhood_id': []
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
        'country_id': ['whosonfirst:country:85633793'],
        'country_a': ['USA'],
        'macroregion': ['MacroRegion Name'],
        'macroregion_id': ['whosonfirst:macroregion:foobar'],
        'macroregion_a': ['MacroRegion Abbreviation'],
        'region': ['New York'],
        'region_id': ['whosonfirst:region:85688543'],
        'region_a': ['NY'],
        'macrocounty': ['MacroCounty Name'],
        'macrocounty_id': ['whosonfirst:macrocounty:~~~~~'],
        'macrocounty_a': ['MacroCounty Abbreviation'],
        'county': ['Kings County'],
        'county_id': ['whosonfirst:county:102082361'],
        'county_a': [null],
        'localadmin': ['Brooklyn'],
        'localadmin_id': ['whosonfirst:localadmin:404521211'],
        'localadmin_a': [null],
        'locality': ['Some Locality'],
        'locality_id': ['whosonfirst:locality:85977539'],
        'locality_a': [null],
        'neighbourhood': [],
        'neighbourhood_id': []
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
