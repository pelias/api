
var generator = require('../../../helper/labelGenerator');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('interface', function(t) {
    t.equal(typeof generator, 'function', 'valid function');
    t.end();
  });
};

// major USA city
module.exports.tests.san_francisco = function(test, common) {
  test('san francisco', function(t) {
    var doc = {
      'name': { 'default': 'San Francisco' },
      'country_a': 'USA',
      'country': 'United States',
      'region': 'California',
      'region_a': 'CA',
      'county': 'San Francisco County',
      'locality': 'San Francisco'
    };
    t.equal(generator(doc),'San Francisco, San Francisco County, CA, USA');
    t.end();
  });
};

// USA venue
module.exports.tests.nyc_office = function(test, common) {
  test('30 West 26th Street', function(t) {
    var doc = {
      'name': { 'default': '30 West 26th Street' },
      'housenumber': '30',
      'street': 'West 26th Street',
      'postalcode': '10010',
      'country_a': 'USA',
      'country': 'United States',
      'region': 'New York',
      'region_a': 'NY',
      'county': 'New York County',
      'localadmin': 'Manhattan',
      'locality': 'New York',
      'neighbourhood': 'Flatiron District'
    };
    t.equal(generator(doc),'30 West 26th Street, Manhattan, NY, USA');
    t.end();
  });
};

// USA NYC eatery
module.exports.tests.nyc_bakery = function(test, common) {
  test('New York Bakery', function(t) {
    var doc = {
      'name': { 'default': 'New York Bakery' },
      'housenumber': '51 W',
      'street': '29th',
      'country_a': 'USA',
      'country': 'United States',
      'region': 'New York',
      'region_a': 'NY',
      'county': 'New York County',
      'localadmin': 'Manhattan',
      'locality': 'New York',
      'neighbourhood': 'Koreatown'
    };
    t.equal(generator(doc),'New York Bakery, Manhattan, NY, USA');
    t.end();
  });
};

// USA SFC building
module.exports.tests.ferry_building = function(test, common) {
  test('Ferry Building', function(t) {
    var doc = {
      'name': { 'default': 'Ferry Building' },
      'country_a': 'USA',
      'country': 'United States',
      'region': 'California',
      'region_a': 'CA',
      'county': 'San Francisco County',
      'locality': 'San Francisco',
      'neighbourhood': 'Financial District'
    };
    t.equal(generator(doc),'Ferry Building, San Francisco, CA, USA');
    t.end();
  });
};

// USA geonames state
module.exports.tests.california_geonames = function(test, common) {
  test('default name should not be prepended when source=geonames and layer=region', function(t) {
    var doc = {
      'name': { 'default': 'California' },
      'country_a': 'USA',
      'country': 'United States',
      'region': 'California',
      'region_a': 'CA',
      'source': 'geonames',
      'layer': 'region'
    };
    t.equal(generator(doc),'CA, USA');
    t.end();
  });
};

// USA whosonfirst state
module.exports.tests.california_whosonfirst = function(test, common) {
  test('default name should not be prepended when source=whosonfirst and layer=region', function(t) {
    var doc = {
      'name': { 'default': 'California' },
      'country_a': 'USA',
      'country': 'United States',
      'region': 'California',
      'region_a': 'CA',
      'source': 'whosonfirst',
      'layer': 'region'
    };
    t.equal(generator(doc),'CA, USA');
    t.end();
  });
};

// USA non-geonames/whosonfirst state
module.exports.tests.california_other_source = function(test, common) {
  test('default name should not be prepended when source=whosonfirst and layer=region', function(t) {
    var doc = {
      'name': { 'default': 'California' },
      'country_a': 'USA',
      'country': 'United States',
      'region': 'California',
      'region_a': 'CA',
      'source': 'not geonames or whosonfirst',
      'layer': 'region'
    };
    t.equal(generator(doc),'California, CA, USA');
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('label generator: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
