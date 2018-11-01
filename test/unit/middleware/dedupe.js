var data = require('../fixture/dedupe_elasticsearch_results');
var nonAsciiData = require('../fixture/dedupe_elasticsearch_nonascii_results');
var customLayerData = require('../fixture/dedupe_elasticsearch_custom_layer_results');
var onlyPostalcodeDiffersData = require('../fixture/dedupe_only_postalcode_differs');
var dedupe = require('../../../middleware/dedupe')();

module.exports.tests = {};

module.exports.tests.dedupe = function(test, common) {
  test('filter out duplicates', function(t) {
    var req = {
      clean: {
        text: 'lampeter strasburg high school',
        size: 100
      }
    };
    var res = {
      data: data
    };

    var expectedCount = 8;
    dedupe(req, res, function () {
      t.equal(res.data.length, expectedCount, 'results have fewer items than before');
      t.end();
    });
  });

  test('handle non-ascii gracefully', function(t) {
    var req = {
      clean: {
        size: 100
      }
    };
    var res = {
      data: nonAsciiData
    };

    var expectedCount = 4;
    dedupe(req, res, function () {
      t.equal(res.data.length, expectedCount, 'none were removed');
      t.end();
    });
  });

  test('truncate results based on specified size', function(t) {
    var req = {
      clean: {
        text: 'lampeter strasburg high school',
        size: 3
      }
    };
    var res = {
      data: data
    };

    dedupe(req, res, function () {
      t.equal(res.data.length, req.clean.size, 'results have fewer items than before');
      t.end();
    });
  });

  test('truncate results based on size 1', function(t) {
    var req = {
      clean: {
        text: 'lampeter strasburg high school',
        size: 1
      }
    };
    var res = {
      data: data
    };

    dedupe(req, res, function () {
      t.equal(res.data.length, req.clean.size, 'should only return 1 result');
      t.end();
    });
  });

  test('deduplicate between custom layers and venue layers', function(t) {
    var req = {
      clean: {
        size: 20
      }
    };
    var res = {
      data: customLayerData
    };
    var expected = customLayerData[1]; // non-canonical record

    dedupe(req, res, function () {
      t.equal(res.data.length, 1, 'only one result displayed');
      t.equal(res.data[0], expected, 'non-canonical data is preferred');
      t.end();
    });
  });

  test('test records with no address except one has postalcode', function(t) {
    var req = {
      clean: {
        size: 20
      }
    };
    var res = {
      data: onlyPostalcodeDiffersData
    };
    var expected = onlyPostalcodeDiffersData[1]; // record with postcode

    dedupe(req, res, function () {
      t.equal(res.data.length, 1, 'only one result displayed');
      t.equal(res.data[0], expected, 'record with postalcode is preferred');
      t.end();
    });
  });

  test('test records with no address except one has postalcode', function(t) {
    var req = {
      clean: {
        size: 20
      }
    };
    var res = {
      data: onlyPostalcodeDiffersData
    };
    var expected = onlyPostalcodeDiffersData[1]; // record with postcode

    dedupe(req, res, function () {
      t.equal(res.data.length, 1, 'only one result displayed');
      t.equal(res.data[0], expected, 'record with postalcode is preferred');
      t.end();
    });
  });
};


module.exports.tests.priority = function(test, common) {
  test('whosonfirst takes priority over geonames, replace', function (t) {
    var req = {
      clean: {
        text: 'Lancaster',
        size: 100
      }
    };
    var res = {
      data:  [
        {
          'name': { 'default': 'Lancaster' },
          'source': 'geonames',
          'source_id': '123456',
          'layer': 'locality'
        },
        {
          'name': { 'default': 'Lancaster' },
          'source': 'whosonfirst',
          'source_id': '654321',
          'layer': 'locality'
        }
      ]
    };

    var expectedCount = 1;
    dedupe(req, res, function () {
      t.equal(res.data.length, expectedCount, 'results have fewer items than before');
      t.deepEqual(res.data[0].source, 'whosonfirst', 'whosonfirst result won');
      t.end();
    });
  });

  test('whosonfirst takes priority over geonames, no replace', function (t) {
    var req = {
      clean: {
        text: 'Lancaster',
        size: 100
      }
    };
    var res = {
      data:  [
        {
          'name': { 'default': 'Lancaster' },
          'source': 'whosonfirst',
          'source_id': '123456',
          'layer': 'locality'
        },
        {
          'name': { 'default': 'Lancaster' },
          'source': 'geonames',
          'source_id': '654321',
          'layer': 'locality'
        }
      ]
    };

    var expectedCount = 1;
    dedupe(req, res, function () {
      t.equal(res.data.length, expectedCount, 'results have fewer items than before');
      t.deepEqual(res.data[0].source, 'whosonfirst', 'whosonfirst result won');
      t.end();
    });
  });

  test('openstreetmap takes priority over whosonfirst venues', function (t) {
    var req = {
      clean: {
        text: 'Lancaster Dairy Farm',
        size: 100
      }
    };
    var res = {
      data:  [
        {
          'name': { 'default': 'Lancaster Dairy Farm' },
          'source': 'openstreetmap',
          'source_id': '123456',
          'layer': 'venue'
        },
        {
          'name': { 'default': 'Lancaster Dairy Farm' },
          'source': 'whosonfirst',
          'source_id': '654321',
          'layer': 'venue'
        }
      ]
    };

    var expectedCount = 1;
    dedupe(req, res, function () {
      t.equal(res.data.length, expectedCount, 'results have fewer items than before');
      t.deepEqual(res.data[0].source, 'openstreetmap', 'openstreetmap result won');
      t.end();
    });
  });

  test('openaddresses takes priority over openstreetmap', function (t) {
    var req = {
      clean: {
        text: '100 Main St',
        size: 100
      }
    };
    var res = {
      data:  [
        {
          'name': { 'default': '100 Main St' },
          'source': 'openstreetmap',
          'source_id': '123456',
          'layer': 'address'
        },
        {
          'name': { 'default': '100 Main St' },
          'source': 'openaddresses',
          'source_id': '654321',
          'layer': 'address'
        }
      ]
    };

    var expectedCount = 1;
    dedupe(req, res, function () {
      t.equal(res.data.length, expectedCount, 'results have fewer items than before');
      t.deepEqual(res.data[0].source, 'openaddresses', 'openaddresses result won');
      t.end();
    });
  });

  test('openaddresses with zip takes priority over openaddresses without zip', function (t) {
    var req = {
      clean: {
        text: '100 Main St',
        size: 100
      }
    };
    var res = {
      data:  [
        {
          'name': { 'default': '100 Main St' },
          'source': 'openaddresses',
          'source_id': '123456',
          'layer': 'address',
          'address_parts': {}
        },
        {
          'name': { 'default': '100 Main St' },
          'source': 'openaddresses',
          'source_id': '654321',
          'layer': 'address',
          'address_parts': {
            'zip': '54321'
          }
        }
      ]
    };

    var expectedCount = 1;
    dedupe(req, res, function () {
      t.equal(res.data.length, expectedCount, 'results have fewer items than before');
      t.deepEqual(res.data[0].source_id, '654321', 'openaddresses result with zip won');
      t.end();
    });
  });

  test('osm with zip takes priority over openaddresses without zip', function (t) {
    var req = {
      clean: {
        text: '100 Main St',
        size: 100
      }
    };
    var res = {
      data:  [
        {
          'name': { 'default': '100 Main St' },
          'source': 'openaddresses',
          'source_id': '123456',
          'layer': 'address',
          'address_parts': {}
        },
        {
          'name': { 'default': '100 Main St' },
          'source': 'openstreetmap',
          'source_id': '654321',
          'layer': 'address',
          'address_parts': {
            'zip': '54321'
          }
        }
      ]
    };

    var expectedCount = 1;
    dedupe(req, res, function () {
      t.equal(res.data.length, expectedCount, 'results have fewer items than before');
      t.deepEqual(res.data[0].source_id, '654321', 'openstreetmap result with zip won');
      t.end();
    });
  });

  test('works with name aliases', function (t) {
    var req = {
      clean: {
        text: '100 Main St',
        size: 100
      }
    };
    var res = {
      data:  [
        {
          'name': { 'default': ['100 Main St'] }, // note the array
          'source': 'openaddresses',
          'source_id': '123456'
        },
        {
          'name': { 'default': '100 Main St' },
          'source': 'openstreetmap',
          'source_id': '654321'
        }
      ]
    };

    t.doesNotThrow(() => {
      dedupe(req, res, () => {});
    });

    t.equal(res.data.length, 1, 'results have fewer items than before');
    t.end();
  });

  test('continent and locality not considered synonymous, do not replace', function (t) {
    var req = {
      clean: {
        text: 'Asia',
        size: 100
      }
    };
    var res = {
      data:  [
        {
          'name': { 'default': 'Asia' },
          'source': 'whosonfirst',
          'source_id': '123456',
          'layer': 'continent'
        },
        {
          'name': { 'default': 'Asia' },
          'source': 'whosonfirst',
          'source_id': '654321',
          'layer': 'locality'
        }
      ]
    };

    var expectedCount = 2;
    dedupe(req, res, function () {
      t.equal(res.data.length, expectedCount, 'no deduplication applied');
      t.end();
    });
  });
  test('locality takes priority over country, replace', function (t) {
    var req = {
      clean: {
        text: 'Singapore',
        size: 100
      }
    };
    var res = {
      data:  [
        {
          'name': { 'default': 'Singapore' },
          'source': 'whosonfirst',
          'source_id': '123456',
          'layer': 'country'
        },
        {
          'name': { 'default': 'Singapore' },
          'source': 'whosonfirst',
          'source_id': '654321',
          'layer': 'locality'
        }
      ]
    };

    var expectedCount = 1;
    dedupe(req, res, function () {
      t.equal(res.data.length, expectedCount, 'results have fewer items than before');
      t.deepEqual(res.data[0].layer, 'locality', 'locality result won');
      t.end();
    });
  });

  test('locality takes priority over county, replace', function (t) {
    var req = {
      clean: {
        text: 'Auckland',
        size: 100
      }
    };
    var res = {
      data:  [
        {
          'name': { 'default': 'Auckland' },
          'source': 'whosonfirst',
          'source_id': '123456',
          'layer': 'county'
        },
        {
          'name': { 'default': 'Auckland' },
          'source': 'whosonfirst',
          'source_id': '654321',
          'layer': 'locality'
        }
      ]
    };

    var expectedCount = 1;
    dedupe(req, res, function () {
      t.equal(res.data.length, expectedCount, 'results have fewer items than before');
      t.deepEqual(res.data[0].layer, 'locality', 'locality result won');
      t.end();
    });
  });

  test('localadmin takes priority over region, replace', function (t) {
    var req = {
      clean: {
        text: 'Bern',
        size: 100
      }
    };
    var res = {
      data:  [
        {
          'name': { 'default': 'Bern' },
          'source': 'whosonfirst',
          'source_id': '123456',
          'layer': 'region'
        },
        {
          'name': { 'default': 'Bern' },
          'source': 'whosonfirst',
          'source_id': '654321',
          'layer': 'localadmin'
        }
      ]
    };

    var expectedCount = 1;
    dedupe(req, res, function () {
      t.equal(res.data.length, expectedCount, 'results have fewer items than before');
      t.deepEqual(res.data[0].layer, 'localadmin', 'localadmin result won');
      t.end();
    });
  });

  test('locality takes priority over county, neighbourhood and localadmin, replace', function (t) {
    var req = {
      clean: {
        text: 'Parramatta',
        size: 100
      }
    };
    var res = {
      data:  [
        {
          'name': { 'default': 'Parramatta' },
          'source': 'whosonfirst',
          'source_id': '123456',
          'layer': 'county'
        },
        {
          'name': { 'default': 'Parramatta' },
          'source': 'whosonfirst',
          'source_id': '7890',
          'layer': 'neighbourhood'
        },
        {
          'name': { 'default': 'Parramatta' },
          'source': 'whosonfirst',
          'source_id': '0987',
          'layer': 'localadmin'
        },
        {
          'name': { 'default': 'Parramatta' },
          'source': 'whosonfirst',
          'source_id': '654321',
          'layer': 'locality'
        }
      ]
    };

    var expectedCount = 1;
    dedupe(req, res, function () {
      t.equal(res.data.length, expectedCount, 'results have fewer items than before');
      t.deepEqual(res.data[0].layer, 'locality', 'locality result won');
      t.end();
    });
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('[middleware] dedupe: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
