
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
    'source': 'whosonfirst',
    'layer': 'continent',
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
      geojsonify.search( earth );
    });
    t.end();
  });

};

module.exports.tests.search = function(test, common) {

  var input = [
    {
      '_id': 'id1',
      '_type': 'layer1',
      'source': 'source1',
      'layer': 'layer1',
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
      'category': [
        'food',
        'nightlife'
      ]
    },
    {
      '_id': 'id2',
      '_type': 'layer2',
      'source': 'source2',
      'layer': 'layer2',
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
    },
    {
      '_id': 'node:34633854',
      '_type': 'venue',
      'source': 'openstreetmap',
      'layer': 'venue',
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
          'id': 'id1',
          'gid': 'source1:layer1:id1',
          'layer': 'layer1',
          'source': 'source1',
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
          'housenumber': '13',
          'street': 'Liverpool Road',
          'postalcode': 'N1 0RW'
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
          'id': 'id2',
          'gid': 'source2:layer2:id2',
          'layer': 'layer2',
          'source': 'source2',
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
          'id': 'node:34633854',
          'gid': 'openstreetmap:venue:node:34633854',
          'layer': 'venue',
          'source': 'openstreetmap',
          'label': 'Empire State Building, Manhattan, NY, USA',
          'name': 'Empire State Building',
          'country_a': 'USA',
          'country': 'United States',
          'region': 'New York',
          'region_a': 'NY',
          'county': 'New York',
          'localadmin': 'Manhattan',
          'locality': 'New York',
          'neighbourhood': 'Koreatown'
        }
      }
    ]
  };

  test('geojsonify.search(doc)', function(t) {
    var json = geojsonify.search( input );
    t.deepEqual(json, expected, 'all docs mapped');
    t.end();
  });

  test('filtering out empty items', function (t) {
    var input = [
      {
        'bounding_box': {
          'min_lat': 40.6514712164,
          'max_lat': 40.6737320588,
          'min_lon': -73.8967895508,
          'max_lon': -73.8665771484
        },
        'locality': [
          'New York'
        ],
        'source': 'whosonfirst',
        'layer': 'neighbourhood',
        'population': 173198,
        'popularity': 495,
        'center_point': {
          'lon': -73.881319,
          'lat': 40.663303
        },
        'name': {
          'default': 'East New York'
        },
        'source_id': '85816607',
        'category': [],
        '_id': '85816607',
        '_type': 'neighbourhood',
        '_score': 21.434,
        'confidence': 0.888,
        'country': [
          'United States'
        ],
        'country_gid': [
          '85633793'
        ],
        'country_a': [
          'USA'
        ],
        'macroregion': [
          'MacroRegion Name'
        ],
        'macroregion_gid': [
          'MacroRegion Id'
        ],
        'macroregion_a': [
          'MacroRegion Abbreviation'
        ],
        'region': [
          'New York'
        ],
        'region_gid': [
          '85688543'
        ],
        'region_a': [
          'NY'
        ],
        'macrocounty': [
          'MacroCounty Name'
        ],
        'macrocounty_gid': [
          'MacroCounty Id'
        ],
        'macrocounty_a': [
          'MacroCounty Abbreviation'
        ],
        'county': [
          'Kings County'
        ],
        'county_gid': [
          '102082361'
        ],
        'county_a': [
          null
        ],
        'localadmin': [
          'Brooklyn'
        ],
        'localadmin_gid': [
          '404521211'
        ],
        'localadmin_a': [
          null
        ],
        'locality_gid': [
          '85977539'
        ],
        'locality_a': [
          null
        ],
        'neighbourhood': [],
        'neighbourhood_gid': []
      }
    ];

    var expected = {
      'type': 'FeatureCollection',
      'bbox': [-73.8967895508, 40.6514712164, -73.8665771484, 40.6737320588],
      'features': [
        {
          'type': 'Feature',
          'properties': {
            'id': '85816607',
            'gid': 'whosonfirst:neighbourhood:85816607',
            'layer': 'neighbourhood',
            'source': 'whosonfirst',
            'name': 'East New York',
            'confidence': 0.888,
            'country': 'United States',
            'country_gid': '85633793',
            'country_a': 'USA',
            'macroregion': 'MacroRegion Name',
            'macroregion_gid': 'MacroRegion Id',
            'macroregion_a': 'MacroRegion Abbreviation',
            'region': 'New York',
            'region_gid': '85688543',
            'region_a': 'NY',
            'macrocounty': 'MacroCounty Name',
            'macrocounty_gid': 'MacroCounty Id',
            'macrocounty_a': 'MacroCounty Abbreviation',
            'county': 'Kings County',
            'county_gid': '102082361',
            'localadmin': 'Brooklyn',
            'localadmin_gid': '404521211',
            'locality': 'New York',
            'locality_gid': '85977539',
            'label': 'East New York, Brooklyn, NY, USA'
          },
          'bbox': [-73.8967895508,40.6514712164,-73.8665771484,40.6737320588],
          'geometry': {
            'type': 'Point',
            'coordinates': [
              -73.881319,
              40.663303
            ]
          }
        }
      ]
    };

    var json = geojsonify.search( input );
    t.deepEqual(json, expected, 'all wanted properties exposed:' + ' # ' + JSON.stringify(json) + ' # ' + JSON.stringify(expected) );
    t.end();
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
