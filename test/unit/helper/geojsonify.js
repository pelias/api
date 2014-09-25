
var geojsonify = require('../../../helper/geojsonify');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface .suggest()', function(t) {
    t.equal(typeof geojsonify.suggest, 'function', 'suggest is a function');
    t.equal(geojsonify.suggest.length, 1, 'accepts x arguments');
    t.end();
  });
};

module.exports.tests.suggest = function(test, common) {

  var input = [{
    bingo1: 'bango1',
    payload: {
      id: 'foo1/bar1',
      geo: '100,-10.5'
    }
  },{
    bingo2: 'bango2',
    payload: {
      id: 'foo2/bar2',
      geo: '10,-1.5'
    }
  }];

  var expected = {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            100,
            -10.5
          ]
        },
        "properties": {
          "bingo1": "bango1",
          "type": "foo1",
          "id": "bar1"
        }
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
            10,
            -1.5
          ]
        },
        "properties": {
          "bingo2": "bango2",
          "type": "foo2",
          "id": "bar2"
        }
      }
    ]
  };

  test('geojsonify.suggest()', function(t) {
    var json = geojsonify.suggest( input );
    t.deepEqual(json, expected, 'all docs mapped');
    t.end();
  });
};


module.exports.tests.search = function(test, common) {

  var input = [
    {
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
      "admin0": "United Kingdom",
      "admin1": "Islington",
      "admin2": "Angel",
      "suggest": {
        "input": [
          "'round midnight jazz and blues bar"
        ],
        "payload": {
          "id": "osmnode/2208150035",
          "geo": "-0.10697160000000001,51.53371440000001"
        },
        "output": "'Round Midnight Jazz and Blues Bar, Angel, United Kingdom"
      }
    },
    {
      "type": "way",
      "name": {
        "default": "Blues Cafe"
      },
      "center_point": {
        "lat": "51.517806",
        "lon": "-0.101795"
      },
      "admin0": "United Kingdom",
      "admin1": "City And County Of The City Of London",
      "admin2": "Smithfield",
      "suggest": {
        "input": [
          "blues cafe"
        ],
        "payload": {
          "id": "osmway/147495160",
          "geo": "-0.101795,51.517806"
        },
        "output": "Blues Cafe, Smithfield, United Kingdom"
      }
    }
  ];

  var expected = {
    "type": "FeatureCollection",
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
          "text": "'Round Midnight Jazz and Blues Bar, Angel, United Kingdom",
          "name": "'Round Midnight Jazz and Blues Bar",
          "admin0": "United Kingdom",
          "admin1": "Islington",
          "admin2": "Angel"
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
          "text": "Blues Cafe, Smithfield, United Kingdom",
          "name": "Blues Cafe",
          "admin0": "United Kingdom",
          "admin1": "City And County Of The City Of London",
          "admin2": "Smithfield"
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