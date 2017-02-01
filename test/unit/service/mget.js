
var service = require('../../../service/mget'),
    mockBackend = require('../mock/backend');

const proxyquire = require('proxyquire').noCallThru();

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    var service = proxyquire('../../../service/mget', {
      'pelias-logger': {
        get: (section) => {
          t.equal(section, 'api');
        }
      }

    });

    t.equal(typeof service, 'function', 'service is a function');
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
      parent: { country: ['country1'], region: ['state1'], county: ['city1'] }
    },
    {
      _id: 'myid2', _type: 'mytype2',
      value: 2,
      center_point: { lat: 100.2, lon: -51.5 },
      name: { default: 'test name2' },
      parent: { country: ['country2'], region: ['state2'], county: ['city2'] }
    }
  ];

  test('valid query', function(t) {
    var backend = mockBackend( 'client/mget/ok/1', function( cmd ){
      t.deepEqual(cmd, { body: { docs: [ { _id: 123, _index: 'pelias', _type: 'a' } ] } }, 'correct backend command');
    });
    service( backend, [ { _id: 123, _index: 'pelias', _type: 'a' } ], function(err, data) {
      t.true(Array.isArray(data), 'returns an array');
      data.forEach(function(d) {
        t.true(typeof d === 'object', 'valid object');
      });
      t.deepEqual(data, expected, 'values correctly mapped');
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
      // mock out pelias-logger so we can assert what's being logged
      var service = proxyquire('../../../service/mget', {
        'pelias-logger': {
          get: () => {
            return {
              error: (msg) => {
                t.equal(msg, 'elasticsearch error an elasticsearch error occurred');
              }
            };
          }
        }

      });

      service( backend, [ query ], function(err, data) {
        t.equal(err, 'an elasticsearch error occurred','error passed to errorHandler');
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
