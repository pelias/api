
var generator = require('../../../helper/labelGenerator');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('interface', function(t) {
    t.equal(typeof generator, 'function', 'valid function');
    t.end();
  });
};

// GBR street address
module.exports.tests.one_main_street_uk = function(test, common) {
  test('one main street uk', function(t) {
    var doc = {
      'name': '1 Main St',
      'housenumber': '1',
      'street': 'Main St',
      'postalcode': 'BT77 0BG',
      'country_a': 'GBR',
      'country': 'United Kingdom',
      'region': 'Dungannon'
    };
    t.equal(generator(doc),'1 Main St, Dungannon, United Kingdom');
    t.end();
  });
};

// GBR venue
module.exports.tests.hackney_city_farm = function(test, common) {
  test('hackney city farm', function(t) {
    var doc = {
      'name': 'Hackney City Farm',
      'country_a': 'GBR',
      'country': 'United Kingdom',
      'region': 'Hackney',
      'county': 'Greater London',
      'locality': 'London',
      'neighbourhood': 'Haggerston'
    };
    t.equal(generator(doc),'Hackney City Farm, Haggerston, Greater London');
    t.end();
  });
};

// GBR country
module.exports.tests.wales = function(test, common) {
  test('wales', function(t) {
    var doc = {
      'name': 'Wales',
      'country_a': 'GBR',
      'country': 'United Kingdom',
      'region': 'Wales'
    };
    t.equal(generator(doc),'Wales, United Kingdom');
    t.end();
  });
};

// GBR macroregion
module.exports.tests.macroregion_trumps_region = function(test, common) {
  test('macroregion should trump region when none of neighbourhood, county, localadmin, locality are available', function(t) {
    var doc = {
      'name': 'Name',
      'country_a': 'GBR',
      'country': 'Country Name',
      'macroregion': 'Macroregion Name',
      'region': 'Region Name'
    };

    t.equal(generator(doc), 'Name, Macroregion Name, Country Name');
    t.end();

  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('label generator (GBR): ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
