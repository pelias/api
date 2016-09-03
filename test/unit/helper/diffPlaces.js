var isDifferent= require('../../../helper/diffPlaces').isDifferent;

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
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('[helper] diffPlaces: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
