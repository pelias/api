var generator = require('../../../helper/labelGenerator');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('interface', function(t) {
    t.equal(typeof generator, 'function', 'valid function');
    t.end();
  });
};

module.exports.tests.united_states = function(test, common) {
  test('venue', function(t) {
    var doc = {
      'name': 'venue name',
      'layer': 'venue',
      'housenumber': 'house number',
      'street': 'street name',
      'neighbourhood': 'neighbourhood name',
      'locality': 'locality name',
      'localadmin': 'localadmin name',
      'county': 'county name',
      'macrocounty': 'macrocounty name',
      'region_a': 'region abbr',
      'region': 'region name',
      'macroregion': 'macroregion name',
      'country_a': 'USA',
      'country': 'United States'
    };
    t.equal(generator(doc),'venue name, locality name, region abbr, USA');
    t.end();
  });

  test('localadmin value should be used when there is no locality', function(t) {
    var doc = {
      'name': 'venue name',
      'layer': 'venue',
      'housenumber': 'house number',
      'street': 'street name',
      'neighbourhood': 'neighbourhood name',
      'localadmin': 'localadmin name',
      'county': 'county name',
      'macrocounty': 'macrocounty name',
      'region_a': 'region abbr',
      'region': 'region name',
      'macroregion': 'macroregion name',
      'country_a': 'USA',
      'country': 'United States'
    };
    t.equal(generator(doc),'venue name, localadmin name, region abbr, USA');
    t.end();
  });

test('county value should be used when there is no localadmin', function(t) {
    var doc = {
      'name': 'venue name',
      'layer': 'venue',
      'housenumber': 'house number',
      'street': 'street name',
      'neighbourhood': 'neighbourhood name',
      'county': 'county name',
      'macrocounty': 'macrocounty name',
      'region_a': 'region abbr',
      'region': 'region name',
      'macroregion': 'macroregion name',
      'country_a': 'USA',
      'country': 'United States'
    };
    t.equal(generator(doc),'venue name, county name, region abbr, USA');
    t.end();
  });

  test('street', function(t) {
    var doc = {
      'name': 'house number street name',
      'layer': 'address',
      'housenumber': 'house number',
      'street': 'street name',
      'neighbourhood': 'neighbourhood name',
      'locality': 'locality name',
      'localadmin': 'localadmin name',
      'county': 'county name',
      'macrocounty': 'macrocounty name',
      'region_a': 'region abbr',
      'region': 'region name',
      'macroregion': 'macroregion name',
      'country_a': 'USA',
      'country': 'United States'
    };
    t.equal(generator(doc),'house number street name, locality name, region abbr, USA');
    t.end();
  });

  test('neighbourhood', function(t) {
    var doc = {
      'name': 'neighbourhood name',
      'layer': 'neighbourhood',
      'neighbourhood': 'neighbourhood name',
      'locality': 'locality name',
      'localadmin': 'localadmin name',
      'county': 'county name',
      'macrocounty': 'macrocounty name',
      'region_a': 'region abbr',
      'region': 'region name',
      'macroregion': 'macroregion name',
      'country_a': 'USA',
      'country': 'United States'
    };
    t.equal(generator(doc),'neighbourhood name, locality name, region abbr, USA');
    t.end();
  });

  test('venue in borough', function(t) {
    var doc = {
      'name': 'venue name',
      'layer': 'borough',
      'neighbourhood': 'neighbourhood name',
      'borough': 'borough name',
      'locality': 'locality name',
      'localadmin': 'localadmin name',
      'county': 'county name',
      'macrocounty': 'macrocounty name',
      'region_a': 'region abbr',
      'region': 'region name',
      'macroregion': 'macroregion name',
      'country_a': 'USA',
      'country': 'United States'
    };
    t.equal(generator(doc),'venue name, borough name, locality name, region abbr, USA');
    t.end();
  });

  test('locality', function(t) {
    var doc = {
      'name': 'locality name',
      'layer': 'locality',
      'locality': 'locality name',
      'localadmin': 'localadmin name',
      'county': 'county name',
      'macrocounty': 'macrocounty name',
      'region_a': 'region abbr',
      'region': 'region name',
      'macroregion': 'macroregion name',
      'country_a': 'USA',
      'country': 'United States'
    };
    t.equal(generator(doc),'locality name, region abbr, USA');
    t.end();
  });

  test('localadmin', function(t) {
    var doc = {
      'name': 'localadmin name',
      'layer': 'localadmin',
      'localadmin': 'localadmin name',
      'county': 'county name',
      'macrocounty': 'macrocounty name',
      'region_a': 'region abbr',
      'region': 'region name',
      'macroregion': 'macroregion name',
      'country_a': 'USA',
      'country': 'United States'
    };
    t.equal(generator(doc),'localadmin name, region abbr, USA');
    t.end();
  });

  test('county', function(t) {
    var doc = {
      'name': 'county name',
      'layer': 'county',
      'county': 'county name',
      'macrocounty': 'macrocounty name',
      'region_a': 'region abbr',
      'region': 'region name',
      'macroregion': 'macroregion name',
      'country_a': 'USA',
      'country': 'United States'
    };
    t.equal(generator(doc),'county name, region abbr, USA');
    t.end();
  });

  test('macrocounty', function(t) {
    var doc = {
      'name': 'macrocounty name',
      'layer': 'macrocounty',
      'macrocounty': 'macrocounty name',
      'region_a': 'region abbr',
      'region': 'region name',
      'macroregion': 'macroregion name',
      'country_a': 'USA',
      'country': 'United States'
    };
    t.equal(generator(doc),'macrocounty name, region abbr, USA');
    t.end();
  });

  test('region', function(t) {
    var doc = {
      'name': 'region name',
      'layer': 'region',
      'region_a': 'region abbr',
      'region': 'region name',
      'macroregion': 'macroregion name',
      'country_a': 'USA',
      'country': 'United States'
    };
    t.equal(generator(doc),'region name, USA');
    t.end();
  });

  test('macroregion', function(t) {
    var doc = {
      'name': 'macroregion name',
      'layer': 'macroregion',
      'macroregion': 'macroregion name',
      'country_a': 'USA',
      'country': 'United States'
    };
    t.equal(generator(doc),'macroregion name, USA');
    t.end();
  });

  test('country', function(t) {
    var doc = {
      'name': 'United States',
      'layer': 'country',
      'country_a': 'USA',
      'country': 'United States'
    };
    t.equal(generator(doc),'United States');
    t.end();
  });

  test('region should be used when region_a is not available', function(t) {
    var doc = {
      'name': 'locality name',
      'locality': 'locality name',
      'localadmin': 'localadmin name',
      'county': 'county name',
      'macrocounty': 'macrocounty name',
      'region': 'region name',
      'macroregion': 'macroregion name',
      'country_a': 'USA',
      'country': 'United States'
    };
    t.equal(generator(doc),'locality name, region name, USA', 'region should be used');
    t.end();
  });

};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('label generator (USA): ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
