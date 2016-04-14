var generator = require('../../../helper/labelGenerator');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('interface', function(t) {
    t.equal(typeof generator, 'function', 'valid function');
    t.end();
  });
};

module.exports.tests.canada = function(test, common) {
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
      'country_a': 'CAN',
      'country': 'Canada'
    };
    t.equal(generator(doc),'venue name, locality name, region abbr, Canada');
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
      'country_a': 'CAN',
      'country': 'Canada'
    };
    t.equal(generator(doc),'house number street name, locality name, region abbr, Canada');
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
      'country_a': 'CAN',
      'country': 'Canada'
    };
    t.equal(generator(doc),'neighbourhood name, locality name, region abbr, Canada');
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
      'country_a': 'CAN',
      'country': 'Canada'
    };
    t.equal(generator(doc),'locality name, region abbr, Canada');
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
      'country_a': 'CAN',
      'country': 'Canada'
    };
    t.equal(generator(doc),'localadmin name, region abbr, Canada');
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
      'country_a': 'CAN',
      'country': 'Canada'
    };
    t.equal(generator(doc),'county name, region abbr, Canada');
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
      'country_a': 'CAN',
      'country': 'Canada'
    };
    t.equal(generator(doc),'macrocounty name, region abbr, Canada');
    t.end();
  });

  test('region', function(t) {
    var doc = {
      'name': 'region name',
      'layer': 'region',
      'region_a': 'region abbr',
      'region': 'region name',
      'macroregion': 'macroregion name',
      'country_a': 'CAN',
      'country': 'Canada'
    };
    t.equal(generator(doc),'region name, Canada');
    t.end();
  });

  test('macroregion', function(t) {
    var doc = {
      'name': 'macroregion name',
      'layer': 'macroregion',
      'macroregion': 'macroregion name',
      'country_a': 'CAN',
      'country': 'Canada'
    };
    t.equal(generator(doc),'macroregion name, Canada');
    t.end();
  });

  test('country', function(t) {
    var doc = {
      'name': 'Canada',
      'layer': 'country',
      'country_a': 'CAN',
      'country': 'Canada'
    };
    t.equal(generator(doc),'Canada');
    t.end();
  });

  test('region should be used when region_a is not available', function(t) {
    var doc = {
      'name': 'locality name',
      'layer': 'region',
      'locality': 'locality name',
      'localadmin': 'localadmin name',
      'county': 'county name',
      'macrocounty': 'macrocounty name',
      'region': 'region name',
      'macroregion': 'macroregion name',
      'country_a': 'CAN',
      'country': 'Canada'
    };
    t.equal(generator(doc),'locality name, region name, Canada', 'region should be used');
    t.end();
  });

};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('label generator (CAN): ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
