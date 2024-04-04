const _ = require('lodash');
const isDifferent = require('../../../helper/diffPlaces').isDifferent;
const isNameDifferent = require('../../../helper/diffPlaces').isNameDifferent;
const normalizeString = require('../../../helper/diffPlaces').normalizeString;
const layerDependentNormalization = require('../../../helper/diffPlaces').layerDependentNormalization;

module.exports.tests = {};

module.exports.tests.dedupe = function(test, common) {

  test('match same object', function(t) {
    var item1 = {
      'parent': {
        'country': [ 'United States' ],
        'county': [ 'Otsego County' ],
        'region_a': [ 'NY' ],
        'localadmin': [ 'Cherry Valley' ],
        'county_id': [ '102082399' ],
        'localadmin_id': [ '404522887' ],
        'country_a': [ 'USA' ],
        'region_id': [ '85688543' ],
        'locality': [ 'Cherry Valley' ],
        'locality_id': [ '85978799' ],
        'region': [ 'New York' ],
        'country_id': [ '85633793' ]
      },
      'name': {
        'default': '1 Main Street'
      },
      'address_parts': {
        'number': '1',
        'street': 'Main Street'
      },
      'layer': 'address'
    };

    t.false(isDifferent(item1, item1), 'should be the same');
    t.end();
  });

  test('catch diff layers', function(t) {
    var item1 = { 'layer': 'address' };
    var item2 = { 'layer': 'venue' };

    t.true(isDifferent(item1, item2), 'should be different');
    t.end();
  });

  test('catch diff parent', function(t) {
    var item1 = {
      'layer': 'same',
      'parent': {
        'country_id': '12345'
      }
    };
    var item2 = {
      'layer': 'same',
      'parent': {
        'country_id': '54321'
      }
    };

    t.true(isDifferent(item1, item2), 'should be different');
    t.end();
  });

  test('isParentHierarchyDifferent: do not compare parentage at lower levels to the highest item placetypes', function(t) {
    var item1 = {
      'layer': 'country',
      'parent': {
        'localadmin_id': '12345',
        'locality_id': '54321'
      }
    };
    var item2 = {
      'layer': 'country',
      'parent': {
        'localadmin_id': '56789',
        'locality_id': '98765'
      }
    };

    t.false(isDifferent(item1, item2), 'should not be considered different');
    t.end();
  });

  test('isParentHierarchyDifferent: do not dedupe US states', function(t) {
    var item1 = {
      layer: 'region',
      parent: {
        region_id: '123',
        country_a: ['USA']
      }
    };
    var item2 = {
      layer: 'locality',
      parent: {
        region_id: '123',
        locality_id: '456'
      }
    };

    t.true(isDifferent(item1, item2), 'should be considered different');
    t.end();
  });

  test('isParentHierarchyDifferent: do not dedupe US states, except against each other', function(t) {
    var item1 = {
      layer: 'region',
      parent: {
        region_id: '123',
        country_a: ['USA']
      }
    };
    var item2 = {
      layer: 'region',
      parent: {
        region_id: '123',
        country_a: ['USA']
      }
    };

    t.false(isDifferent(item1, item2), 'should not be considered different');
    t.end();
  });

  test('isParentHierarchyDifferent: do compare parentage at higher levels than the highest item placetypes', function(t) {
    var item1 = {
      'layer': 'country',
      'parent': {
        'localadmin_id': '12345',
        'ocean_id': '54321'
      }
    };
    var item2 = {
      'layer': 'country',
      'parent': {
        'localadmin_id': '56789',
        'ocean_id': '98765'
      }
    };

    t.true(isDifferent(item1, item2), 'should be different');
    t.end();
  });

  test('isParentHierarchyDifferent: do compare parentage at higher levels than the lowest item placetypes', function(t) {
    var item1 = {
      name: {
        default: 'theplace'
      },
      'layer': 'localadmin',
      'parent': {
        'localadmin_id': '12345',
        'country_id': '5'
      }
    };
    var item2 = {
      name: {
        default: 'theplace'
      },
      'layer': 'country',
      'parent': {
        'country_id': '5'
      }
    };

    t.false(isDifferent(item1, item2), 'should be different');
    t.end();
  });

  // postalcodes with same name and country_a but differing hierarchies should be considered same
  test('isParentHierarchyDifferent: postalcodes with same country_a', function(t) {
    var item1 = {
      name: {
        default: '90210'
      },
      layer: 'postalcode',
      parent: {
        'locality_id': '456',
        'postalcode_id': '12345',
        'country_id': '555',
        'country_a': 'USA'
      }
    };
    var item2 = {
      name: {
        default: '90210'
      },
      layer: 'postalcode',
      parent: {
        'locality_id': '789',
        'postalcode_id': '67890',
        'country_id': '555',
        'country_a': 'USA'
      }
    };

    t.false(isDifferent(item1, item2), 'should not be considered different');
    t.end();
  });

  // postalcodes with same name and dependency_a but differing hierarchies should be considered same
  test('isParentHierarchyDifferent: postalcodes with same dependency_a', function(t) {
    var item1 = {
      name: {
        default: '90210'
      },
      layer: 'postalcode',
      parent: {
        'locality_id': '456',
        'postalcode_id': '12345',
        'dependency_id': '555',
        'dependency_a': 'PRI'
      }
    };
    var item2 = {
      name: {
        default: '90210'
      },
      layer: 'postalcode',
      parent: {
        'locality_id': '789',
        'postalcode_id': '67890',
        'dependency_id': '555',
        'dependency_a': 'PRI'
      }
    };

    t.false(isDifferent(item1, item2), 'should not be considered different');
    t.end();
  });

  // postalcodes with same name but differing country_a should still be considered different
  test('isParentHierarchyDifferent: postalcodes with same name, different country_a', function(t) {
    var item1 = {
      name: {
        default: '90210'
      },
      layer: 'postalcode',
      parent: {
        'locality_id': '456',
        'postalcode_id': '12345',
        'country_id': '555',
        'country_a': 'USA'
      }
    };
    var item2 = {
      name: {
        default: '90210'
      },
      layer: 'postalcode',
      parent: {
        'locality_id': '789',
        'postalcode_id': '67890',
        'country_id': '444',
        'country_a': 'NZL'
      }
    };

    t.true(isDifferent(item1, item2), 'should be different');
    t.end();
  });

  // postalcodes with differing name but same country_a should still be considered different
  test('isParentHierarchyDifferent: postalcodes with different name, same country_a', function(t) {
    var item1 = {
      name: {
        default: '10010'
      },
      layer: 'postalcode',
      parent: {
        'locality_id': '456',
        'postalcode_id': '12345',
        'country_id': '555',
        'country_a': 'USA'
      }
    };
    var item2 = {
      name: {
        default: '90210'
      },
      layer: 'postalcode',
      parent: {
        'locality_id': '789',
        'postalcode_id': '67890',
        'country_id': '555',
        'country_a': 'USA'
      }
    };

    t.true(isDifferent(item1, item2), 'should be different');
    t.end();
  });

  test('catch diff name', function(t) {
    var item1 = {
      'name': {
        'default': '1 Main St'
      }
    };
    var item2 = {
      'name': {
        'default': '1 Broad St'
      }
    };

    t.true(isDifferent(item1, item2), 'should be different');
    t.end();
  });

  test('match diff capitalization in name', function(t) {
    var item1 = {
      'name': {
        'default': '1 MAIN ST'
      }
    };
    var item2 = {
      'name': {
        'default': '1 Main St'
      }
    };

    t.false(isDifferent(item1, item2), 'should be the same');
    t.end();
  });

  test('do not handle expansions', function(t) {
    // we currently don't handle expansions and abbreviations and
    // this is a test waiting to be updated as soon as we fix it

    var item1 = {
      'name': {
        'default': '1 Main Street'
      }
    };
    var item2 = {
      'name': {
        'default': '1 Main St'
      }
    };

    t.true(isDifferent(item1, item2), 'should be different');
    t.end();
  });

  test('missing names in other langs should not be a diff', function(t) {
    var item1 = {
      'name': {
        'default': 'Moscow',
        'rus': 'Москва'
      }
    };
    var item2 = {
      'name': {
        'default': 'Moscow'
      }
    };

    t.false(isDifferent(item1, item2), 'should be the same');
    t.end();
  });

  test('improved matching across languages - if default name is the same, consider this a match', function(t) {
    var item1 = {
      'name': {
        'default': 'Bern',
        'eng': 'Bern',
        'deu': 'Kanton Bern',
        'fra': 'Berne'
      }
    };
    var item2 = {
      'name': {
        'default': 'Bern',
        'eng': 'Berne',
        'deu': 'Bundesstadt', // note: this is wrong, see: https://github.com/whosonfirst-data/whosonfirst-data/issues/1363
        'fra': 'Berne'
      }
    };

    t.false(isDifferent(item1, item2), 'should be the same');
    t.end();
  });

  test('improved matching across languages - if default different, but user language matches default, consider this a match', function(t) {
    var item1 = {
      'name': {
        'default': 'English Name',
        'eng': 'A Name'
      }
    };
    var item2 = {
      'name': {
        'default': 'A Name'
      }
    };

    t.false(isDifferent(item1, item2, 'eng'), 'should be the same');
    t.end();
  });


  test('improved matching across languages - if default different, but user language matches (fra), consider this a match', function(t) {
    var item1 = {
      'name': {
        'default': 'Name',
        'fra': 'French Name'
      }
    };
    var item2 = {
      'name': {
        'default': 'Another Name',
        'fra': 'French Name'
      }
    };

    t.false(isDifferent(item1, item2, 'fra'), 'should be the same');
    t.end();
  });

  test('improved matching across languages - default names differ but match another language', function(t) {
    var item1 = {
      'name': {
        'default': 'Berne',
        'eng': 'Bern',
        'deu': 'Kanton Bern',
        'fra': 'Berne'
      }
    };
    var item2 = {
      'name': {
        'default': 'Bern',
        'eng': 'Berne',
        'deu': 'Bundesstadt',
        'fra': 'Berne'
      }
    };

    t.false(isDifferent(item1, item2), 'should be the same');
    t.end();
  });

  test('catch diff address', function(t) {
    var item1 = {
      'address_parts': {
        'number': '1',
        'street': 'Main Street',
        'zip': '90210'
      }
    };
    var item2 = {
      'address_parts': {
        'number': '2',
        'street': 'Main Street',
        'zip': '90210'
      }
    };

    t.true(isDifferent(item1, item2), 'should be different');
    t.end();
  });

  test('catch diff address', function(t) {
    var item1 = {
      'address_parts': {
        'number': '1',
        'street': 'Main Street',
        'zip': '90210'
      }
    };
    var item2 = {
      'address_parts': {
        'number': '1',
        'street': 'Main Street'
      }
    };

    t.false(isDifferent(item1, item2), 'should be the same');
    t.end();
  });

  test('completely empty objects', function(t) {
    var item1 = {};
    var item2 = {};

    t.false(isDifferent(item1, item2), 'should be the same');
    t.end();
  });

  test('works with name aliases', function(t) {
    var item1 = {
      'name': {
        'default': ['a','b'] // note the array
      }
    };
    var item2 = {
      'name': {
        'default': 'a'
      }
    };

    t.false(isDifferent(item1, item2), 'should be the same');
    t.end();
  });
};

module.exports.tests.isNameDifferent = function (test, common) {
  test('missing names', function (t) {
    t.false(isNameDifferent({}, {}), 'both have no name');
    t.false(isNameDifferent({ name: { default: 'a' } }, {}), 'B has no name');
    t.false(isNameDifferent({}, { name: { default: 'b' } }), 'A has no name');
    t.end();
  });
  test('basic matching', function (t) {
    t.false(isNameDifferent(
      { name: { default: 'a' } },
      { name: { default: 'a' } }
    ), 'basic match');

    t.false(isNameDifferent(
      { name: { default: 'a' } },
      { name: { default: ['a'] } }
    ), 'basic match - different types');

    t.false(isNameDifferent(
      { name: { default: ['a'] } },
      { name: { default: 'a' } }
    ), 'basic match - different types - inverse');

    t.false(isNameDifferent(
      { name: { default: 'a' } },
      { name: { default: ['b','a'] } }
    ), 'basic match - different positions');

    t.false(isNameDifferent(
      { name: { default: ['b', 'a'] } },
      { name: { default: 'a' } }
    ), 'basic match - different positions - inverse');

    t.end();
  });
  test('inter-language matching', function (t) {
    t.false(isNameDifferent(
      { name: { default: 'a' } },
      { name: { foo: 'a' } }
    ), 'match default with any lang');

    t.false(isNameDifferent(
      { name: { foo: 'a' } },
      { name: { default: 'a' } }
    ), 'match default with any lang - inverse');

    t.false(isNameDifferent(
      { name: { bar: 'a' } },
      { name: { foo: 'a' } },
      'bar'
    ), 'match using request lang');

    t.false(isNameDifferent(
      { name: { bar: 'a' } },
      { name: { foo: 'a' } },
      'foo'
    ), 'match using request lang - inverse');

    // note: this returns true
    t.true(isNameDifferent(
      { name: { foo: 'a' } },
      { name: { bar: 'a' } }
    ), 'different lang');

    t.end();
  });
  test('real-world tests', function (t) {
    t.false(isNameDifferent(
      { name: { default: 'Malmoe', eng: 'Malmo' } },
      { name: { default: 'Malmö', eng: 'Malmo' } }
    ), 'Malmö');

    t.false(isNameDifferent(
      { name: { default: 'State of New York' }, layer: 'region' },
      { name: { default: 'New York' } }
    ), 'State of *');

    t.false(isNameDifferent(
      { name: { default: 'New York State' }, layer: 'region' },
      { name: { default: 'New York' } }
    ), '* State');

    t.false(isNameDifferent(
      { name: { default: 'County of New York' }, layer: 'county' },
      { name: { default: 'New York' } }
    ), 'County of *');

    t.false(isNameDifferent(
      { name: { default: 'New York County' }, layer: 'county' },
      { name: { default: 'New York' } }
    ), '* County');

    t.false(isNameDifferent(
      { name: { default: 'City of New York' }, layer: 'locality' },
      { name: { default: 'New York' } }
    ), 'City of *');

    t.false(isNameDifferent(
      { name: { default: 'New York City' }, layer: 'locality' },
      { name: { default: 'New York' } }
    ), '* City');

    t.false(isNameDifferent(
      { name: { default: 'Town of New York' }, layer: 'locality' },
      { name: { default: 'New York' } }
    ), 'Town of *');

    t.false(isNameDifferent(
      { name: { default: 'New York Town' }, layer: 'locality' },
      { name: { default: 'New York' } }
    ), '* Town');

    t.false(isNameDifferent(
      { name: { default: 'Township of New York' }, layer: 'locality' },
      { name: { default: 'New York' } }
    ), 'Township of *');

    t.false(isNameDifferent(
      { name: { default: 'New York Township' }, layer: 'locality' },
      { name: { default: 'New York' } }
    ), '* Township');

    t.false(isNameDifferent(
      { name: { default: 'City of New York' }, layer: 'localadmin' },
      { name: { default: 'New York' } }
    ), 'City of *');

    t.false(isNameDifferent(
      { name: { default: 'New York City' }, layer: 'localadmin' },
      { name: { default: 'New York' } }
    ), '* City');

    t.false(isNameDifferent(
      { name: { default: 'Town of New York' }, layer: 'localadmin' },
      { name: { default: 'New York' } }
    ), 'Town of *');

    t.false(isNameDifferent(
      { name: { default: 'New York Town' }, layer: 'localadmin' },
      { name: { default: 'New York' } }
    ), '* Town');

    t.false(isNameDifferent(
      { name: { default: 'Township of New York' }, layer: 'localadmin' },
      { name: { default: 'New York' } }
    ), 'Township of *');

    t.false(isNameDifferent(
      { name: { default: 'New York Township' }, layer: 'locality' },
      { name: { default: 'New York' } }
    ), '* Township');

    t.end();
  });
  test('mutation tests', function (t) {
    // mutation test, $input data should not be mutated
    const input = { name: { default: 'New York City' }, layer: 'locality' };
    const expected = { name: { default: 'New York' } };

    // repeat previous test to ensure that the strings were actually changed
    t.false(isNameDifferent(input, expected), '* City');

    // test that input wasn't mutated in the process
    t.equal(input.name.default, 'New York City');

    t.end();
  });
};

module.exports.tests.normalizeString = function (test, common) {
  test('lowercase', function (t) {
    t.equal(normalizeString('Foo Bar'), 'foo bar');
    t.equal(normalizeString('FOOBAR'), 'foobar');
    t.end();
  });

  test('punctuation', function (t) {
    t.equal(normalizeString('foo, bar'), 'foo bar');
    t.equal(normalizeString('foo-bar'), 'foo bar');
    t.equal(normalizeString('foo , - , - bar'), 'foo bar');
    t.end();
  });

  test('diacritics', function (t) {
    t.equal(normalizeString('Malmö'), 'malmo');
    t.equal(normalizeString('Grolmanstraße'), 'grolmanstrasse');
    t.equal(normalizeString('àáâãäåấắæầằçḉèéêëếḗềḕ'), 'aaaaaaaaaeaacceeeeeeee');
    t.end();
  });
};

module.exports.tests.layerDependentNormalization = function (test, common) {
  test('region', function (t) {
    const norm = _.bind(layerDependentNormalization, null, _, 'region');
    t.deepEqual(norm(
      { default: ['State of Foo', 'State of Bar'], en: ['State of Baz'] }
    ),
      { default: ['Foo', 'Bar'], en: ['Baz'] }
    );
    t.deepEqual(norm(
      { default: ['State of the Foo', 'State of the Bar'], en: ['State of the Baz'] }
    ),
      { default: ['State of the Foo', 'State of the Bar'], en: ['State of the Baz'] }
    );
    t.deepEqual(norm(
      { default: ['Foo State', 'Bar State'], en: ['Baz State'] }
    ),
      { default: ['Foo', 'Bar'], en: ['Baz'] }
    );
    t.end();
  });
  test('county', function (t) {
    const norm = _.bind(layerDependentNormalization, null, _, 'county');
    t.deepEqual(norm(
      { default: ['County of Foo', 'County of Bar'], en: ['County of Baz'] }
    ),
      { default: ['Foo', 'Bar'], en: ['Baz'] }
    );
    t.deepEqual(norm(
      { default: ['County of the Foo', 'County of the Bar'], en: ['County of the Baz'] }
    ),
      { default: ['County of the Foo', 'County of the Bar'], en: ['County of the Baz'] }
    );
    t.deepEqual(norm(
      { default: ['Foo County', 'Bar County'], en: ['Baz County'] }
    ),
      { default: ['Foo', 'Bar'], en: ['Baz'] }
    );
    t.end();
  });
  test('locality', function (t) {
    const norm = _.bind(layerDependentNormalization, null, _, 'locality');
    t.deepEqual(norm(
      { default: ['City of Foo', 'Town of Bar'], en: ['Township of Baz'] }
    ),
      { default: ['Foo', 'Bar'], en: ['Baz'] }
    );
    t.deepEqual(norm(
      { default: ['City of the Foo', 'Town of the Bar'], en: ['Township of the Baz'] }
    ),
      { default: ['City of the Foo', 'Town of the Bar'], en: ['Township of the Baz'] }
    );
    t.deepEqual(norm(
      { default: ['Foo City', 'Bar Town'], en: ['Baz Township'] }
    ),
      { default: ['Foo', 'Bar'], en: ['Baz'] }
    );
    t.end();
  });
  test('only applied to correct layer', function (t) {
    const norm = _.bind(layerDependentNormalization, null, _, 'venue');
    t.deepEqual(norm(
      { default: ['City of Los Angeles Fire Department Station'] }
    ),
      { default: ['City of Los Angeles Fire Department Station'] }
    );
    t.end();
  });
};

module.exports.tests.geonames = function (test, common) {
  test('geonames record with concordance is the same, regardless of anything else', function(t) {
    const gn_record = {
      source: 'geonames',
      source_id: '123',
      name: {
        'default': 'One name'
      }
    };
    const wof_record = {
      source: 'whosonfirst',
      source_id: '345',
      name: {
        default: 'Different name'
      },
      addendum: {
        concordances: '{ "gn:id": 123 }'
      }
    };

    t.false(isDifferent(gn_record, wof_record), 'should be the same based on concordance');
    t.end();
  });
};

module.exports.tests.geonames_self_parent = function (test, common) {
  test('geonames records that parent themselves should not break hierarchy checks', function(t) {
    const gn_record = {
      source: 'geonames',
      layer: 'localadmin',
      source_id: '7163824',
      name: {
        default: 'City of New York'
      },
      parent: {
        country_id: ['85633793'], // USA, WOF
        region_id: ['85688543'], // NY, WOF
        localadmin_id: ['7163824'] // New York County, Geonames
      }
    };
    const wof_record = {
      source: 'whosonfirst',
      layer: 'locality',
      source_id: '85977539',
      name: {
        default: 'New York'
      },
      parent: {
        country_id: ['85633793'], // USA, WOF
        region_id: ['85688543'], // NY, WOF
        //localadmin_id: null // no localadmin is set for NYC in WOF
      }
    };

    t.false(isDifferent(gn_record, wof_record), 'should be the same based on hierarchy');
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('[helper] diffPlaces: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
