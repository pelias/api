
var geojsonify = require('../../../helper/geojsonify');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface .search()', function(t) {
    t.equal(typeof geojsonify.search, 'function', 'search is a function');
    t.equal(geojsonify.search.length, 1, 'accepts x arguments');
    t.end();
  });
};

module.exports.tests.search = function(test, common) {

  var input = [
    {
      "_id": "id1",
      "_type": "type1",
      "center_point": {
        "lat": 51.5337144,
        "lon": -0.1069716
      },
      "name": {
        "default": "'Round Midnight Jazz and Blues Bar"
      },
      "type": "node",
      "address": {
        "number": "13",
        "street": "Liverpool Road",
        "zip": "N1 0RW"
      },
      "alpha3": "GBR",
      "admin0": "United Kingdom",
      "admin1": "Islington",
      "admin1_abbr": "ISL",
      "admin2": "Angel",
      "local_admin": "test1",
      "locality": "test2",
      "neighborhood": "test3",
      "suggest": {
        "input": [
          "'round midnight jazz and blues bar"
        ],
        "output": "osmnode:2208150035"
      }
    },
    {
      "_id": "id2",
      "_type": "type2",
      "type": "way",
      "name": {
        "default": "Blues Cafe"
      },
      "center_point": {
        "lat": "51.517806",
        "lon": "-0.101795"
      },
      "alpha3": "GBR",
      "admin0": "United Kingdom",
      "admin1": "City And County Of The City Of London",
      "admin1_abbr": "COL",
      "admin2": "Smithfield",
      "local_admin": "test1",
      "locality": "test2",
      "neighborhood": "test3",
      "suggest": {
        "input": [
          "blues cafe"
        ],
        "output": "osmway:147495160"
      }
    },
    {
      "_id": "34633854",
      "_type": "osmway",
      "type": "osmway",
      "name": {
        "default": "Empire State Building"
      },
      "center_point": {
        "lat": "40.748432",
        "lon": "-73.985656"
      },
      "alpha3": "USA",
      "admin0": "United States",
      "admin1": "New York",
      "admin1_abbr": "NY",
      "admin2": "New York",
      "local_admin": "Manhattan",
      "locality": "New York",
      "neighborhood": "Koreatown",
      "suggest": {
        "input": [
          "empire state building"
        ],
        "output": "osmway:34633854"
      }
    }
  ];

  var expected = {
    "type": "FeatureCollection",
    "bbox": [ -0.1069716, 51.517806, -0.101795, 51.5337144 ],
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -0.1069716,
            51.5337144
          ]
        },
        "properties": {
          "id": "id1",
          "type": "type1",
          "layer": "type1",
          "text": "'Round Midnight Jazz and Blues Bar, test3, Angel",
          "name": "'Round Midnight Jazz and Blues Bar",
          "alpha3": "GBR",
          "admin0": "United Kingdom",
          "admin1": "Islington",
          "admin1_abbr": "ISL",
          "admin2": "Angel",
          "local_admin": "test1",
          "locality": "test2",
          "neighborhood": "test3"
        }
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -0.101795,
            51.517806
          ]
        },
        "properties": {
          "id": "id2",
          "type": "type2",
          "layer": "type2",
          "text": "Blues Cafe, test3, Smithfield",
          "name": "Blues Cafe",
          "alpha3": "GBR",
          "admin0": "United Kingdom",
          "admin1": "City And County Of The City Of London",
          "admin1_abbr": "COL",
          "admin2": "Smithfield",
          "local_admin": "test1",
          "locality": "test2",
          "neighborhood": "test3"
        }
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -73.985656,
            40.748432
          ]
        },
        "properties": {
          "id": "34633854",
          "type": "osmway",
          "layer": "osmway",
          "text": "Empire State Building, Manhattan, NY",
          "name": "Empire State Building",
          "alpha3": "USA",
          "admin0": "United States",
          "admin1": "New York",
          "admin1_abbr": "NY",
          "admin2": "New York",
          "local_admin": "Manhattan",
          "locality": "New York",
          "neighborhood": "Koreatown"
        }
      }
    ]
  };

  test('geojsonify.search()', function(t) {
    var json = geojsonify.search( input );
    t.deepEqual(json, expected, 'all docs mapped');
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