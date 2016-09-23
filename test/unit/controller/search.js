var setup = require('../../../controller/search'),
    mockBackend = require('../mock/backend'),
    mockQuery = require('../mock/query');
var proxyquire =  require('proxyquire').noCallThru();

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

  // expected geojson features for 'client/suggest/ok/1' fixture
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
    scores: [10, 20],
    query_type: 'mock'
  };

  var expectedData = [
    {
      _id: 'myid1',
      _score: 10,
      _type: 'mytype1',
      _matched_queries: ['query 1', 'query 2'],
      parent: {
        country: ['country1'],
        region: ['state1'],
        county: ['city1']
      },
      center_point: { lat: 100.1, lon: -50.5 },
      name: { default: 'test name1' },
      value: 1
    },
    {
      _id: 'myid2',
      _score: 20,
      _type: 'mytype2',
      _matched_queries: ['query 3'],
      parent: {
        country: ['country2'],
        region: ['state2'],
        county: ['city2']
      },
      center_point: { lat: 100.2, lon: -51.5 },
      name: { default: 'test name2' },
      value: 2
    }
  ];

  test('functional success', function (t) {
    var backend = mockBackend('client/search/ok/1', function (cmd) {
      t.deepEqual(cmd, {
        body: {a: 'b'},
        index: 'pelias',
        searchType: 'dfs_query_then_fetch'
      }, 'correct backend command');
    });
    var controller = setup(fakeDefaultConfig, backend, mockQuery());
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
    var req = { clean: { a: 'b' }, errors: [], warnings: [] };
    var next = function next() {
      t.equal(req.errors.length, 0, 'next was called without error');
      t.deepEqual(res.meta, expectedMeta, 'meta data was set');
      t.deepEqual(res.data, expectedData, 'data was set');
      t.end();
    };
    controller(req, res, next);
  });

  test('functional success with alternate index name', function(t) {
    var fakeCustomizedConfig = {
      indexName: 'alternateindexname'
    };

    var backend = mockBackend('client/search/ok/1', function (cmd) {
      t.deepEqual(cmd, {
        body: {a: 'b'},
        index: 'alternateindexname',
        searchType: 'dfs_query_then_fetch'
      }, 'correct backend command');
    });
    var controller = setup(fakeCustomizedConfig, backend, mockQuery());
    var res = {
      status: function (code) {
        t.equal(code, 200, 'status set');
        return res;
      }
    };
    var req = { clean: { a: 'b' }, errors: [], warnings: [] };
    var next = function next() {
      t.equal(req.errors.length, 0, 'next was called without error');
      t.end();
    };
    controller(req, res, next);
  });
};

// functionally test controller (backend failure)
module.exports.tests.functional_failure = function(test, common) {
  test('functional failure', function(t) {
    var backend = mockBackend( 'client/search/fail/1', function( cmd ){
      t.deepEqual(cmd, { body: { a: 'b' }, index: 'pelias', searchType: 'dfs_query_then_fetch' }, 'correct backend command');
    });
    var controller = setup( fakeDefaultConfig, backend, mockQuery() );
    var req = { clean: { a: 'b' }, errors: [], warnings: [] };
    var next = function(){
      t.equal(req.errors[0],'a backend error occurred');
      t.end();
    };
    controller(req, undefined, next );
  });
};

module.exports.tests.timeout = function(test, common) {
  test('timeout', function(t) {
    var backend = mockBackend( 'client/search/timeout/1', function( cmd ){
      t.deepEqual(cmd, { body: { a: 'b' }, index: 'pelias', searchType: 'dfs_query_then_fetch' }, 'correct backend command');
    });
    var controller = setup( fakeDefaultConfig, backend, mockQuery() );
    var req = { clean: { a: 'b' }, errors: [], warnings: [] };
    var next = function(){
      t.equal(req.errors[0],'Request Timeout after 5000ms');
      t.end();
    };
    controller(req, undefined, next );
  });
};

module.exports.tests.existing_results = function(test, common) {
  test('res with existing data should not call backend', function(t) {
    var backend = function() {
      throw new Error('backend should not have been called');
    };
    var controller = setup( fakeDefaultConfig, backend, mockQuery() );

    var req = { };
    // the existence of `data` means that there are already results so
    // don't call the backend/query
    var res = { data: [{}] };

    var next = function() {
      t.deepEqual(res, {data: [{}]});
      t.end();
    };
    controller(req, res, next);

  });

};

module.exports.tests.undefined_query = function(test, common) {
  test('query returning undefined should not call service', function(t) {
    // a function that returns undefined
    var query = function () { return; };

    var search_service_was_called = false;

    var controller = proxyquire('../../../controller/search', {
      '../service/search': function() {
        search_service_was_called = true;
        throw new Error('search service should not have been called');
      }
    })(undefined, undefined, query);

    var next = function() {
      t.notOk(search_service_was_called, 'should have returned before search service was called');
      t.end();
    };

    controller({}, {}, next);

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
