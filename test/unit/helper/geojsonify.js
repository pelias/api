
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

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('geojsonify: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};