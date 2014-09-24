
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

  // expected geojson features for 'client/suggest/ok/1' fixture
  var expected = [{
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [ 101, -10.1 ]
    },
    properties: {
      id: 'mockid',
      type: 'mocktype',
      value: 1
    }
  }, {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [ 101, -10.1 ]
    },
    properties: {
      id: 'mockid',
      type: 'mocktype',
      value: 2
    }
  }];

  test('functional success', function(t) {
    var backend = mockBackend( 'client/suggest/ok/1', function( cmd ){
      t.deepEqual(cmd, { body: { a: 'b' }, index: 'pelias' }, 'correct backend command');
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
    controller( { clean: { a: 'b' } }, res );
  });
};

// functionally test controller (backend failure)
module.exports.tests.functional_failure = function(test, common) {
  test('functional failure', function(t) {
    var backend = mockBackend( 'client/suggest/fail/1', function( cmd ){
      t.deepEqual(cmd, { body: { a: 'b' }, index: 'pelias' }, 'correct backend command');
    });
    var controller = setup( backend, mockQuery() );
    var next = function( message ){
      t.equal(message,'a backend error occurred','error passed to errorHandler');
      t.end();
    };
    controller( { clean: { a: 'b' } }, undefined, next );
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