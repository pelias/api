
var setup = require('../../../controller/search'),
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

  // expected geojson features for 'client/search/ok/1' fixture
  var expected = [{
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-50.5, 100.1]
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
      coordinates: [-51.5, 100.2]
    },
    properties: {
      id: 'myid2',
      layer: 'mytype2',
      text: 'test name2, city2, state2'
    }
  }];

  var expectedMeta = {
    scores: [10, 20]
  };

  var expectedData = [
    {
      _id: 'myid1',
      _score: 10,
      _type: 'mytype1',
      parent: {
        country: 'country1',
        region: 'state1',
        county: 'city1'
      },
      center_point: { lat: 100.1, lon: -50.5 },
      name: { default: 'test name1' },
      value: 1
    },
    {
      _id: 'myid2',
      _score: 20,
      _type: 'mytype2',
      parent: {
        country: 'country2',
        region: 'state2',
        county: 'city2'
      },
      center_point: { lat: 100.2, lon: -51.5 },
      name: { default: 'test name2' },
      value: 2
    }
  ];

  test('singleton functional success', function (t) {
    var backend = mockBackend('client/search/ok/1', function (cmd) {
      t.deepEqual(cmd, {
        body: {a: 'b'},
        index: 'pelias',
        searchType: 'dfs_query_then_fetch'
      }, 'correct backend command');
    });
    var controller = setup(backend, mockQuery());
    var res = {
      status: function (code) {
        t.equal(code, 200, 'status set');
        return res;
      },
      json: function (json) {
        t.equal(typeof json, 'object', 'returns json');
        t.equal(typeof json.date, 'number', 'date set');
        t.equal(json.type, 'FeatureCollection', 'valid geojson');
        t.true(Array.isArray(json.features), 'features is array');
        t.deepEqual(json.features, expected, 'values correctly mapped');
      }
    };
    var req = { clean: { a: 'b' }, errors: {}, warnings: {} };
    var next = function next() {
      t.deepEqual(req.errors, {}, 'next was called without error');
      t.ok(res.results);
      t.deepEqual(res.results.meta, expectedMeta, 'meta data was set');
      t.deepEqual(res.results.data, expectedData, 'data was set');
      t.end();
    };
    controller(req, res, next);
  });
};

module.exports.tests.array_functional_success = function(test, common) {
  // expected geojson features for 'client/msearch/ok/1' fixture
  var expected = [
    [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-50.5, 100.1]
        },
        properties: {
          id: 'myid1',
          layer: 'mytype1',
          text: 'test name1, city1, state1'
        }
      }
    ],
    [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-51.5, 100.2]
        },
        properties: {
          id: 'myid2',
          layer: 'mytype2',
          text: 'test name2, city2, state2'
        }
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-52.5, 100.3]
        },
        properties: {
          id: 'myid3',
          layer: 'mytype3',
          text: 'test name3, city3, state3'
        }
      }
    ]
  ];

  var expectedMeta = [
    { scores: [10] },
    { scores: [20,30] }
  ];

  var expectedData = [
    [
      {
        _id: 'myid1',
        _score: 10,
        _type: 'mytype1',
        admin0: 'country1',
        admin1: 'state1',
        admin2: 'city1',
        center_point: { lat: 100.1, lon: -50.5 },
        name: { default: 'test name1' },
        value: 1
      }
    ],
    [
      {
        _id: 'myid2',
        _score: 20,
        _type: 'mytype2',
        admin0: 'country2',
        admin1: 'state2',
        admin2: 'city2',
        center_point: { lat: 100.2, lon: -51.5 },
        name: { default: 'test name2' },
        value: 2
      },
      {
        _id: 'myid3',
        _score: 30,
        _type: 'mytype3',
        admin0: 'country3',
        admin1: 'state3',
        admin2: 'city3',
        center_point: { lat: 100.3, lon: -52.5 },
        name: { default: 'test name3' },
        value: 3
      }
    ]
  ];

  function testIt(t, numItems) {
    var queries = {body: [
      { index: 'pelias', searchType: 'dfs_query_then_fetch' },
      { a: 'b' },
      { index: 'pelias', searchType: 'dfs_query_then_fetch' },
      { a: 'c' }
    ]};

    var backend = mockBackend('client/msearch/ok/1', function (cmd) {
      var expected = {body: queries.body.slice(0, numItems*2)};
      t.deepEqual(cmd, expected, 'correct backend command');
    });
    var controller = setup(backend, mockQuery());
    var res = {
      status: function (code) {
        t.equal(code, 200, 'status set');
        return res;
      },
      json: function (json) {
        t.equal(typeof json, 'array', 'returns json array');
        t.equal(json.length, numItems, 'correct number of results returned');
        json.forEach(function(item, index) {
          t.equal(typeof item.date, 'number', 'date set');
          t.equal(item.type, 'FeatureCollection', 'valid geojson');
          t.true(Array.isArray(item.features), 'features is array');
          t.deepEqual(item.features, expected[index], 'values correctly mapped');
        });
      }
    };

    var cleans = [{ a: 'b'}, {a: 'c'}].slice(0, numItems);
    var req = { clean: cleans, errors: {}, warnings: {} };
    var next = function next() {
      t.deepEqual(req.errors, {}, 'next was called without error');
      t.ok(res.results);
      t.equal(res.results.length, numItems, 'results has correct number of items');
      res.results.forEach(function(result, index) {
        t.deepEqual(result.meta, expectedMeta[index], 'meta data was set');
        t.deepEqual(result.data, expectedData[index], 'data was set');
      });
      t.end();
    };
    controller(req, res, next);
  }

  test('one-item array functional success', function (t) {
    testIt(t, 1);
  });

  test('two-item array functional success', function (t) {
    testIt(t, 2);
  });
};

// functionally test controller (backend failure)
module.exports.tests.functional_failure = function(test, common) {
  test('functional failure', function(t) {
    var backend = mockBackend( 'client/search/fail/1', function( cmd ){
      t.deepEqual(cmd, { body: { a: 'b' }, index: 'pelias', searchType: 'dfs_query_then_fetch' }, 'correct backend command');
    });
    var controller = setup( backend, mockQuery() );
    var req = { clean: { a: 'b' }, errors: {}, warnings: {} };
    var next = function(){
      t.equal(req.errors[0][0],'a backend error occurred');
      t.end();
    };
    controller(req, undefined, next );
  });
};

module.exports.tests.array_functional_failure = function(test, common) {
  test('functional failure', function(t) {
    var backend = mockBackend( 'client/msearch/fail/1', function( cmd ){
      var expected = {body: [
        {index: 'pelias', searchType: 'dfs_query_then_fetch'},
        {a: 'b'}
      ]};
      t.deepEqual(cmd, expected, 'correct backend command');
    });
    var controller = setup( backend, mockQuery() );
    var req = { clean: [{ a: 'b' }], errors: {}, warnings: {} };
    var next = function(){
      t.equal(req.errors[0][0],'a backend error occurred');
      t.end();
    };
    controller(req, undefined, next );
  });
};

module.exports.tests.array_query_failure = function(test, common) {
  test('functional failure', function(t) {
    var backend = mockBackend( 'client/msearch/queryerror/1', function( cmd ){
      var expected = {body: [
        {index: 'pelias', searchType: 'dfs_query_then_fetch'},
        {a: 'b'},
        {index: 'pelias', searchType: 'dfs_query_then_fetch'},
        {a: 'c'}
      ]};
      t.deepEqual(cmd, expected, 'correct backend command');
    });
    var controller = setup( backend, mockQuery() );
    var req = { clean: [{ a: 'b' }, { a: 'c' }], errors: {}, warnings: {} };
    var res = {};
    var next = function(){
      t.equal(req.errors[0][0],'Query error');
      t.true(Array.isArray(res.results[1].data), 'Working query returned data');
      t.equal(res.results[1].data.length, 2, 'Working query returned correct number of results');
      t.ok(res.results[1].meta, 'Working query returned meta');
      t.end();
    };
    controller(req, res, next );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('GET /search ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
