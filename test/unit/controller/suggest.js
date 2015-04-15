
var setup = require('../../../controller/suggest'),
    mockBackend = require('../mock/backend'),
    mockQuery = require('../mock/query');

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

  // expected geojson features for 'client/mget/ok/1' fixture
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
    var backend = mockBackend( 'client/suggest/ok/1', function( cmd ){
      // the backend executes suggest (vanilla and admin-only) and mget, so we check them all based on cmd
      if( cmd.body.docs ){
        t.deepEqual(cmd, { 
          body: { docs: [ 
            { _id: 'mockid1', _index: 'pelias', _type: 'mocktype' }, 
            { _id: 'mockid2', _index: 'pelias', _type: 'mocktype' }
          ]}
        }, 'correct mget command');
      } else {
        t.deepEqual(cmd, { body: { input: 'b' }, index: 'pelias' }, 'correct suggest command');
      }
    });
    var controller = setup( backend, mockQuery() );
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
    controller( { clean: { input: 'b' } }, res );
  });

  var detailed_expectation = [{
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

  test('functional success (with details)', function(t) {
    var backend = mockBackend( 'client/suggest/ok/1', function( cmd ){
      // the backend executes suggest (vanilla and admin-only) and mget, so we check them all based on cmd
      if( cmd.body.docs ){
        t.deepEqual(cmd, { 
          body: { docs: [ 
            { _id: 'mockid1', _index: 'pelias', _type: 'mocktype' }, 
            { _id: 'mockid2', _index: 'pelias', _type: 'mocktype' }
          ]}
        }, 'correct mget command');
      } else {
        t.deepEqual(cmd, { body: { input: 'b', details: true }, index: 'pelias' }, 'correct suggest command');
      }
    });
    var controller = setup( backend, mockQuery() );
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
        t.deepEqual(json.features, detailed_expectation, 'values with details correctly mapped');
        t.end();
      }
    };
    controller( { clean: { input: 'b', details: true } }, res );
  });
};

// functionally test controller (backend failure)
module.exports.tests.functional_failure = function(test, common) {
  test('functional failure', function(t) {
    var backend = mockBackend( 'client/suggest/fail/1', function( cmd ){
      if( cmd.body.docs ){
        t.deepEqual(cmd, { 
          body: { docs: [ 
            { _id: 'mockid1', _index: 'pelias', _type: 'mocktype' }, 
            { _id: 'mockid2', _index: 'pelias', _type: 'mocktype' }] 
          } 
        }, 'correct mget command');
      } else if (cmd.body.layers) {
        // layers are set exclusively for admin: test for admin-only layers
        t.deepEqual(cmd, { body: { a: 'b', layers: [ 'admin0', 'admin1', 'admin2' ] }, index: 'pelias' }, 
        'correct suggest/admin command');
      } else {
        t.deepEqual(cmd, { body: { a: 'b' }, index: 'pelias' }, 'correct suggest command');
      }
    });
    var controller = setup( backend, mockQuery() );
    var next = function( message ){
      t.equal(message,'a backend error occurred','error passed to errorHandler');
    };
    controller( { clean: { a: 'b' } }, undefined, next );
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('GET /suggest ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};