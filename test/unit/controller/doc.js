
var setup = require('../../../controller/doc'),
    mockBackend = require('../mock/backend');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof setup, 'function', 'setup is a function');
    t.equal(typeof setup(), 'function', 'setup returns a controller');
    t.end();
  });
};

// functionally test controller (backend success)
module.exports.tests.functional_success = function(test, common) {

  // expected geojson features for 'client/doc/ok/1' fixture
  var expected = [{
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [ -50.5, 100.1 ]
    },
    properties: {
      id: 'myid1',
      layer: 'mytype1',
      name: 'test name1',
      admin0: 'country1',
      admin1: 'state1',
      admin2: 'city1',
      text: 'test name1, city1, state1'
    }
  }, {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [ -51.5, 100.2 ]
    },
    properties: {
      id: 'myid2',
      layer: 'mytype2',
      name: 'test name2',
      admin0: 'country2',
      admin1: 'state2',
      admin2: 'city2',
      text: 'test name2, city2, state2'
    }
  }];

  test('functional success', function(t) {
    var backend = mockBackend( 'client/mget/ok/1', function( cmd ){
      t.deepEqual(cmd, { body: { docs: [ { _id: 123, _index: 'pelias', _type: 'a' } ] } }, 'correct backend command');
    });
    var controller = setup( backend );
    var res = {
      status: function( code ){
        t.equal(code, 200, 'status set');
        return res;
      },
      json: function( json ){
        t.equal(typeof json, 'object', 'returns json');
        t.equal(typeof json.date, 'number', 'date set');
        t.equal(json.type, 'FeatureCollection', 'valid geojson');
        t.true(Array.isArray(json.features), 'features is array');
        t.deepEqual(json.features, expected, 'values correctly mapped');
        t.end();
      }
    };
    controller( { clean: { ids: [ {'id' : 123, 'type': 'a' } ] } }, res );
  });
};

// functionally test controller (backend failure)
module.exports.tests.functional_failure = function(test, common) {
  test('functional failure', function(t) {
    var backend = mockBackend( 'client/mget/fail/1', function( cmd ){
      t.deepEqual(cmd, { body: { docs: [ { _id: 123, _index: 'pelias', _type: 'b' } ] } }, 'correct backend command');
    });
    var controller = setup( backend );
    var next = function( message ){
      t.equal(message,'a backend error occurred','error passed to errorHandler');
      t.end();
    };
    controller( { clean: { ids: [ {'id' : 123, 'type': 'b' } ] } }, undefined, next );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('GET /doc ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};