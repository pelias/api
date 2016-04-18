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
      'name': 'Tim Horton\'s',
      'layer': 'venue',
      'housenumber': '1',
      'street': 'Main St',
      'neighbourhood': 'College Heights',
      'locality': 'Thunder Bay',
      'region_a': 'ON',
      'region': 'Ontario',
      'country_a': 'CAN',
      'country': 'Canada'
    };
    t.equal(generator(doc),'Tim Horton\'s, Thunder Bay, ON, Canada');
    t.end();
  });

  test('address', function(t) {
    var doc = {
      'name': '1 Main St',
      'layer': 'venue',
      'housenumber': '1',
      'street': 'Main St',
      'locality': 'Truth or Consequences',
      'region_a': 'NM',
      'region': 'New Mexico',
      'country_a': 'USA',
      'country': 'United States'
    };
    t.equal(generator(doc),'1 Main St, Truth or Consequences, NM, USA');
    t.end();
  });
};

module.exports.tests.france = function(test, common) {
  test('eiffel tower', function(t) {
    var doc = {
      'name': 'Tour Eiffel',
      'layer': 'venue',
      'neighbourhood': 'Quartier du Gros-Caillou',
      'locality': 'Paris',
      'region': 'Paris',
      'country_a': 'FRA',
      'country': 'France'
    };
    t.equal(generator(doc),'Tour Eiffel, Paris, France');
    t.end();
  });

  test('France street address', function(t) {
    var doc = {
      'name': '74 rue de rivoli',
      'layer': 'address',
      'housenumber': '74',
      'street': 'Rue de Rivoli',
      'neighbourhood': 'Quartier Saint-Merri',
      'locality': 'Paris',
      'region': 'Paris',
      'country_a': 'FRA',
      'country': 'France'
    };
    t.equal(generator(doc),'74 rue de rivoli, Paris, France');
    t.end();
  });

  test('France neighbourhood', function(t) {
    var doc = {
      'name': 'Grange aux Belles Terrage',
      'layer': 'neighbourhood',
      'neighbourhood': 'Grange aux Belles Terrage',
      'locality': 'Paris',
      'region': 'Paris',
      'country_a': 'FRA',
      'country': 'France'
    };
    t.equal(generator(doc),'Grange aux Belles Terrage, Paris, France');
    t.end();
  });

  test('Luxembourg (the city) in Luxembourg', function(t) {
    var doc = {
      'name': 'Luxembourg',
      'layer': 'locality',
      'locality': 'Luxembourg',
      'country_a': 'LUX',
      'country': 'Luxembourg'
    };
    // console.error(generator(doc));
    t.equal(generator(doc),'Luxembourg, Luxembourg');
    t.end();
  });

};

module.exports.tests.name_only = function(test, common) {
  test('name-only results (no admin fields) should not include extraneous comma', function(t) {
    var doc = {
      'name': 'Result name',
    };
    t.equal(generator(doc),'Result name');
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
