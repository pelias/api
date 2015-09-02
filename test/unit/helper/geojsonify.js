
var geojsonify = require('../../../helper/geojsonify');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface .search()', function(t) {
    t.equal(typeof geojsonify.search, 'function', 'search is a function');
    t.equal(geojsonify.search.length, 2, 'accepts x arguments');
    t.end();
  });
};

// ref: https://github.com/pelias/pelias/issues/84
module.exports.tests.earth = function(test, common) {

  var earth = [{
    '_type': 'geoname',
    '_id': '6295630',
    'name': {
      'default': 'Earth'
    },
    'center_point': {
      'lon': 0,
      'lat': 0
    }
  }];

  test('earth', function(t) {
    t.doesNotThrow(function(){
      geojsonify.search( earth, { details: true } );
    });
    t.end();
  });

};

module.exports.tests.search = function(test, common) {

  var input = [
    {
      '_id': 'id1',
      '_type': 'type1',
      'center_point': {
        'lat': 51.5337144,
        'lon': -0.1069716
      },
      'name': {
        'default': '\'Round Midnight Jazz and Blues Bar'
      },
      'housenumber': '13',
      'street': 'Liverpool Road',
      'postalcode': 'N1 0RW',
      'country_a': 'GBR',
      'country': 'United Kingdom',
      'region': 'Islington',
      'region_a': 'ISL',
      'county': 'Angel',
      'localadmin': 'test1',
      'locality': 'test2',
      'neighbourhood': 'test3',
      'suggest': {
        'input': [
          '\'round midnight jazz and blues bar'
        ],
        'output': 'osmnode:2208150035'
      },
      'category': [
        'food',
        'nightlife'
      ]
    },
    {
      '_id': 'id2',
      '_type': 'type2',
      'name': {
        'default': 'Blues Cafe'
      },
      'center_point': {
        'lat': '51.517806',
        'lon': '-0.101795'
      },
      'country_a': 'GBR',
      'country': 'United Kingdom',
      'region': 'City And County Of The City Of London',
      'region_a': 'COL',
      'county': 'Smithfield',
      'localadmin': 'test1',
      'locality': 'test2',
      'neighbourhood': 'test3',
      'suggest': {
        'input': [
          'blues cafe'
        ],
        'output': 'osmway:147495160'
      }
    },
    {
      '_id': '34633854',
      '_type': 'osmway',
      'name': {
        'default': 'Empire State Building'
      },
      'center_point': {
        'lat': '40.748432',
        'lon': '-73.985656'
      },
      'country_a': 'USA',
      'country': 'United States',
      'region': 'New York',
      'region_a': 'NY',
      'county': 'New York',
      'localadmin': 'Manhattan',
      'locality': 'New York',
      'neighbourhood': 'Koreatown',
      'suggest': {
        'input': [
          'empire state building'
        ],
        'output': 'osmway:34633854'
      },
      'category': [
        'tourism',
        'transport'
      ]
    }
  ];

  var expected = {
    'type': 'FeatureCollection',
    'bbox': [ -73.985656, 40.748432, -0.101795, 51.5337144 ],
    'features': [
      {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [
            -0.1069716,
            51.5337144
          ]
        },
        'properties': {
          'geocoding': {
            'id': 'id1',
            'layer': 'type1',
            'source': 'type1',
            'label': '\'Round Midnight Jazz and Blues Bar, test3, Angel',
            'name': '\'Round Midnight Jazz and Blues Bar',
            'country_a': 'GBR',
            'country': 'United Kingdom',
            'region': 'Islington',
            'region_a': 'ISL',
            'county': 'Angel',
            'localadmin': 'test1',
            'locality': 'test2',
            'neighbourhood': 'test3',
            'category': ['food', 'nightlife'],
            'housenumber': '13',
            'street': 'Liverpool Road',
            'postalcode': 'N1 0RW'
          }
        }
      },
      {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [
            -0.101795,
            51.517806
          ]
        },
        'properties': {
          'geocoding': {
            'id': 'id2',
            'layer': 'type2',
            'source': 'type2',
            'label': 'Blues Cafe, test3, Smithfield',
            'name': 'Blues Cafe',
            'country_a': 'GBR',
            'country': 'United Kingdom',
            'region': 'City And County Of The City Of London',
            'region_a': 'COL',
            'county': 'Smithfield',
            'localadmin': 'test1',
            'locality': 'test2',
            'neighbourhood': 'test3'
          }
        }
      },
      {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [
            -73.985656,
            40.748432
          ]
        },
        'properties': {
          'geocoding': {
            'id': '34633854',
            'layer': 'venue',
            'source': 'osm',
            'label': 'Empire State Building, Manhattan, NY',
            'name': 'Empire State Building',
            'country_a': 'USA',
            'country': 'United States',
            'region': 'New York',
            'region_a': 'NY',
            'county': 'New York',
            'localadmin': 'Manhattan',
            'locality': 'New York',
            'neighbourhood': 'Koreatown',
            'category': ['tourism', 'transport']
          }
        }
      }
    ]
  };

  var truthy_params = [true, 1];

  test('geojsonify.search(doc, true) with details', function(t) {
    var json = geojsonify.search( input, { details: true } );
    t.deepEqual(json, expected, 'all docs (with details) mapped');
    t.end();
  });

  truthy_params.forEach(function(details) {
    test('geojsonify.search(doc, '+ details +') with details', function(t) {
      var json = geojsonify.search( input, { details: details } );
      t.deepEqual(json, expected, 'all docs (with details) mapped');
      t.end();
    });
  });

  var no_details_expected = {
    'type': 'FeatureCollection',
    'bbox': [ -73.985656, 40.748432, -0.101795, 51.5337144 ],
    'features': [
      {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [
            -0.1069716,
            51.5337144
          ]
        },
        'properties': {
          'geocoding': {
            'id': 'id1',
            'layer': 'type1',
            'source': 'type1',
            'label': '\'Round Midnight Jazz and Blues Bar, test3, Angel'
          }
        }
      },
      {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [
            -0.101795,
            51.517806
          ]
        },
        'properties': {
          'geocoding': {
            'id': 'id2',
            'layer': 'type2',
            'source': 'type2',
            'label': 'Blues Cafe, test3, Smithfield'
          }
        }
      },
      {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [
            -73.985656,
            40.748432
          ]
        },
        'properties': {
          'geocoding': {
            'id': '34633854',
            'layer': 'venue',
            'source': 'osm',
            'label': 'Empire State Building, Manhattan, NY'
          }
        }
      }
    ]
  };

  test('geojsonify.search(doc) with no details (default)', function(t) {
    var json = geojsonify.search( input );
    t.deepEqual(json, no_details_expected, 'all docs (with no details) mapped');
    t.end();
  });

  var falsy_params = [false, undefined, null, 0, -1, 123, 'abc'];

  falsy_params.forEach(function(details) {
    test('geojsonify.search(doc, '+ details +') with no details', function(t) {
      var json = geojsonify.search( input, { details: details } );
      t.deepEqual(json, no_details_expected, 'all docs (with no details) mapped');
      t.end();
    });
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('geojsonify: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};