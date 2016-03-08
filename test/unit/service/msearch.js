
var setup = require('../../../service/msearch'),
    mockBackend = require('../mock/backend');

var example_valid_es_query = {body: [
  { index: 'pelias' },
  { body: { a: 'b' } },
  { index: 'pelias' },
  { body: { a: 'c' } }
]};

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof setup, 'function', 'setup is a function');
    t.end();
  });
};

var expected = [
  [
    {
      _id: 'myid1', _type: 'mytype1',
      _score: 10,
      value: 1,
      center_point: { lat: 100.1, lon: -50.5 },
      name: { default: 'test name1' },
      admin0: 'country1', admin1: 'state1', admin2: 'city1'
    }
  ],
  [
    {
      _id: 'myid2', _type: 'mytype2',
      _score: 20,
      value: 2,
      center_point: { lat: 100.2, lon: -51.5 },
      name: { default: 'test name2' },
      admin0: 'country2', admin1: 'state2', admin2: 'city2'
    },
    {
      _id: 'myid3', _type: 'mytype3',
      _score: 30,
      value: 3,
      center_point: { lat: 100.3, lon: -52.5 },
      name: { default: 'test name3' },
      admin0: 'country3', admin1: 'state3', admin2: 'city3'
    }
  ]
];

var expectedMeta = [
  {scores: [10]},
  {scores: [20, 30]}
];

// functionally test service
module.exports.tests.functional_success_two_items = function(test, common) {
  test('two valid ES queries', function(t) {
    var backend = mockBackend( 'client/msearch/ok/1', function( cmd ){
      t.deepEqual(cmd, example_valid_es_query, 'no change to the command');
    });
    setup( backend, example_valid_es_query, function(err, results) {
      t.true(Array.isArray(results), 'returns an array');
      t.equal(results.length, 2);
      results.forEach(function(r, index) {
        t.true(typeof r === 'object', 'valid object');
        t.deepEqual(r.data, expected[index], 'values correctly mapped');
        t.deepEqual(r.meta, expectedMeta[index], 'meta data correctly mapped');
      });

      t.end();
    });
  });

};

// functionally test service
module.exports.tests.functional_success_one_item = function(test, common) {
  test('one valid ES query', function(t) {
    var validQuery = { body: example_valid_es_query.body.slice(0,2) };
    var backend = mockBackend( 'client/msearch/ok/2', function( cmd ){
      t.deepEqual(cmd, validQuery, 'no change to the command');
    });
    setup( backend, validQuery, function(err, results) {
      t.true(Array.isArray(results), 'returns an array');
      t.equal(results.length, 1);
      t.true(typeof results[0] === 'object', 'valid object');
      t.deepEqual(results[0].data, expected[0], 'values correctly mapped');
      t.deepEqual(results[0].meta, expectedMeta[0], 'meta data correctly mapped');
      t.end();
    });
  });

};

// functionally test service
module.exports.tests.functional_failure = function(test, common) {

  test('connnection-level error', function(t) {
    var invalid_queries = {body: [
      {  },
      { foo: 'bar' }
    ]};

    var backend = mockBackend( 'client/msearch/fail/1', function( cmd ){
      t.notDeepEqual(cmd, example_valid_es_query, 'connnection-level error');
    });
    setup( backend, invalid_queries, function(err, data) {
      t.equal(err, 'a backend error occurred','error passed to errorHandler');
      t.equal(data, undefined, 'data is undefined');
    });
    t.end();
  });

};

// functionally test service
module.exports.tests.functional_queryerror = function(test, common) {

  test('invalid ES query', function(t) {
    var one_invalid_query = {body: [
      { index: 'pelias' },
      {  },
      { index: 'pelias' },
      { body: { a: 'c' } }
    ]};

    var backend = mockBackend( 'client/msearch/queryerror/1', function( cmd ){
      t.notDeepEqual(cmd, example_valid_es_query, 'incorrect backend command');
    });
    setup( backend, one_invalid_query, function(err, results) {
      // An error in one query returns an error in the object for that query,
      // so expect no err here.
      t.notOk(err, undefined,'no error passed to errorHandler');
      t.true(Array.isArray(results), 'returns an array');
      t.equal(results.length, 2);
      t.equal(results[0].error, 'Query error', 'bad query returns an error');
      t.deepEqual(results[0].data, [], 'bad query has no data');
      t.deepEqual(results[0].meta, {scores:[]}, 'bad query has no meta');
      t.equal(results[1].error, undefined, 'correct query has no error');
      t.deepEqual(results[1].data, expected[1], 'values correctly mapped');
      t.deepEqual(results[1].meta, expectedMeta[1], 'meta data correctly mapped');
    });
    t.end();
  });

};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('SERVICE /msearch ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
