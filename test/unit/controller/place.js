var setup = require('../../../controller/place'),
    mockBackend = require('../mock/backend');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof setup, 'function', 'setup is a function');
    t.equal(typeof setup(), 'function', 'setup returns a controller');
    t.end();
  });
};

// reminder: this is only the api subsection of the full config
var fakeDefaultConfig = {
  indexName: 'pelias'
};

// functionally test controller (backend success)
module.exports.tests.functional_success = function(test, common) {

  // expected geojson features for 'client/place/ok/1' fixture
  var expected = [{
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [ -50.5, 100.1 ]
    },
    properties: {
      id: 'myid1',
      layer: 'mytype1',
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
      text: 'test name2, city2, state2'
    }
  }];

  test('functional success', function(t) {
    var backend = mockBackend( 'client/mget/ok/1', function( cmd ){
      t.deepEqual(cmd, { body: { docs: [ { _id: 123, _index: 'pelias', _type: [ 'a' ] } ] } }, 'correct backend command');
    });
    var controller = setup( fakeDefaultConfig, backend );
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
      }
    };
    var req = { clean: { ids: [ {'id' : 123, layers: [ 'a' ] } ] }, errors: [], warnings: [] };
    var next = function next() {
      t.equal(req.errors.length, 0, 'next was called without error');
      t.end();
    };
    controller(req, res, next );
  });

  test('functional success with custom index name', function(t) {
    var fakeCustomizedConfig = {
      indexName: 'alternateindexname'
    };

    var backend = mockBackend( 'client/mget/ok/1', function( cmd ){
      t.deepEqual(cmd, { body: { docs: [ { _id: 123, _index: 'alternateindexname', _type: [ 'a' ] } ] } }, 'correct backend command');
    });
    var controller = setup( fakeCustomizedConfig, backend );
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
      }
    };
    var req = { clean: { ids: [ {'id' : 123, layers: [ 'a' ] } ] }, errors: [], warnings: [] };
    var next = function next() {
      t.equal(req.errors.length, 0, 'next was called without error');
      t.end();
    };
    controller(req, res, next );
  });
};

// functionally test controller (backend failure)
module.exports.tests.functional_failure = function(test, common) {
  test('functional failure', function(t) {
    var backend = mockBackend( 'client/mget/fail/1', function( cmd ){
      t.deepEqual(cmd, { body: { docs: [ { _id: 123, _index: 'pelias', _type: ['b'] } ] } }, 'correct backend command');
    });
    var controller = setup( fakeDefaultConfig, backend );
    var req = { clean: { ids: [ {'id' : 123, layers: [ 'b' ] } ] }, errors: [], warnings: [] };
    var next = function( message ){
      t.equal(req.errors[0],'a backend error occurred','error passed to errorHandler');
      t.end();
    };
    controller(req, undefined, next );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('GET /place ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
