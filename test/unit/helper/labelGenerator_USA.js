var generator = require('../../../helper/labelGenerator');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('interface', function(t) {
    t.equal(typeof generator, 'function', 'valid function');
    t.end();
  });
};

module.exports.tests.localadmin = function(test, common) {
  test('localadmin should trump locality, neighbourhood, and county', function(t) {
    var doc = {
      'name': { 'default': 'Default Name' },
      'country_a': 'USA',
      'country': 'United States',
      'region': 'Region Name',
      'region_a': 'Region Abbr',
      'county': 'County Name',
      'localadmin': 'LocalAdmin Name',
      'locality': 'Locality Name',
      'neighbourhood': 'Neighbourhood Name'
    };
    t.equal(generator(doc),'Default Name, LocalAdmin Name, Region Abbr, USA');
    t.end();
  });
};

module.exports.tests.locality = function(test, common) {
  test('locality should trump neighbourhood and county when localadmin not available', function(t) {
    var doc = {
      'name': { 'default': 'Default Name' },
      'country_a': 'USA',
      'country': 'United States',
      'region': 'Region Name',
      'region_a': 'Region Abbr',
      'county': 'County Name',
      'locality': 'Locality Name',
      'neighbourhood': 'Neighbourhood Name'
    };
    t.equal(generator(doc),'Default Name, Locality Name, Region Abbr, USA');
    t.end();
  });
};

module.exports.tests.neighbourhood = function(test, common) {
  test('neighbourhood should trump county when neither localadmin nor locality', function(t) {
    var doc = {
      'name': { 'default': 'Default Name' },
      'country_a': 'USA',
      'country': 'United States',
      'region': 'Region Name',
      'region_a': 'Region Abbr',
      'county': 'County Name',
      'neighbourhood': 'Neighbourhood Name'
    };
    t.equal(generator(doc),'Default Name, Neighbourhood Name, Region Abbr, USA');
    t.end();
  });
};

module.exports.tests.county = function(test, common) {
  test('county should be used when localadmin, locality, and neighbourhood are not available', function(t) {
    var doc = {
      'name': { 'default': 'Default Name' },
      'country_a': 'USA',
      'country': 'United States',
      'region': 'Region Name',
      'region_a': 'Region Abbr',
      'county': 'County Name'
    };
    t.equal(generator(doc),'Default Name, County Name, Region Abbr, USA');
    t.end();
  });
};

module.exports.tests.region = function(test, common) {
  test('region should be used when region_a is not available', function(t) {
    var doc = {
      'name': { 'default': 'Default Name' },
      'country_a': 'USA',
      'country': 'United States',
      'region': 'Region Name'
    };
    t.equal(generator(doc),'Default Name, Region Name, USA');
    t.end();
  });
};

// USA geonames state
module.exports.tests.region_geonames = function(test, common) {
  test('default name should not be prepended when source=geonames and layer=region', function(t) {
    var doc = {
      'name': { 'default': 'Region Name' },
      'country_a': 'USA',
      'country': 'United States',
      'region': 'Region Name',
      'region_a': 'Region Abbr',
      'source': 'geonames',
      'layer': 'region'
    };
    t.equal(generator(doc),'Region Name, USA');
    t.end();
  });
};

// USA whosonfirst state
module.exports.tests.region_whosonfirst = function(test, common) {
  test('default name should not be prepended when source=whosonfirst and layer=region', function(t) {
    var doc = {
      'name': { 'default': 'Region Name' },
      'country_a': 'USA',
      'country': 'United States',
      'region': 'Region Name',
      'region_a': 'Region Abbr',
      'source': 'whosonfirst',
      'layer': 'region'
    };
    t.equal(generator(doc),'Region Name, USA');
    t.end();
  });
};

// USA non-geonames/whosonfirst state
module.exports.tests.region_other_source = function(test, common) {
  test('default name should be prepended when layer=region and source is not whosonfirst or geonames', function(t) {
    var doc = {
      'name': { 'default': 'Default Name' },
      'country_a': 'USA',
      'country': 'United States',
      'region': 'Region Name',
      'region_a': 'Region Abbr',
      'source': 'not geonames or whosonfirst',
      'layer': 'region'
    };
    t.equal(generator(doc),'Default Name, Region Name, USA',generator(doc));
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

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('label generator: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
