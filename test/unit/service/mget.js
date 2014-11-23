
var setup = require('../../../service/mget'),
    mockBackend = require('../mock/backend');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof setup, 'function', 'setup is a function');
    t.end();
  });
};

// functionally test service 
module.exports.tests.functional_success = function(test, common) {

  var expected = [
    {
      _id: 'myid1', _type: 'mytype1',
      value: 1,
      center_point: { lat: 100.1, lon: -50.5 },
      name: { default: 'test name1' },
      admin0: 'country1', admin1: 'state1', admin2: 'city1'
    }, 
    {
      _id: 'myid2', _type: 'mytype2',
      value: 2,
      center_point: { lat: 100.2, lon: -51.5 },
      name: { default: 'test name2' },
      admin0: 'country2', admin1: 'state2', admin2: 'city2'
    }
  ];

  test('valid query', function(t) {
    var backend = mockBackend( 'client/mget/ok/1', function( cmd ){
      t.deepEqual(cmd, { body: { docs: [ { _id: 123, _index: 'pelias', _type: 'a' } ] } }, 'correct backend command');
    });
    setup( backend, [ { _id: 123, _index: 'pelias', _type: 'a' } ], function(err, data) {
      t.true(Array.isArray(data), 'returns an array');
      data.forEach(function(d) {
        t.true(typeof d === 'object', 'valid object');
      });
      t.deepEqual(data, expected, 'values correctly mapped')
      t.end();
    });
  });

};

// functionally test service
module.exports.tests.functional_failure = function(test, common) {

  test('invalid query', function(t) {
    var invalid_queries = [
      { _id: 123, _index: 'pelias' },
      { _id: 123, _type: 'a' },
      { _index: 'pelias', _type: 'a' },
      { }
    ];

    var backend = mockBackend( 'client/mget/fail/1', function( cmd ){
      t.notDeepEqual(cmd, { body: { docs: [ { _id: 123, _index: 'pelias', _type: 'a' } ] } }, 'incorrect backend command');
    });
    invalid_queries.forEach(function(query) {
      setup( backend, [ query ], function(err, data) {
        t.equal(err, 'a backend error occurred','error passed to errorHandler');
        t.equal(data, undefined, 'data is undefined');
      });
    });
    t.end();
  });

};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('SERVICE /mget ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};