var data = require('../fixture/dedupe_elasticsearch_results');
var nonAsciiData = require('../fixture/dedupe_elasticsearch_nonascii_results');
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
      results: {
        data: data
      }
    };

    var expectedCount = 9;
    dedupe(req, res, function () {
      t.equal(res.results.data.length, expectedCount, 'results have fewer items than before');
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
      results: {
        data: nonAsciiData
      }
    };

    var expectedCount = 4;
    dedupe(req, res, function () {
      t.equal(res.results.data.length, expectedCount, 'none were removed');
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
      results: {
        data: data
      }
    };

    dedupe(req, res, function () {
      t.equal(res.results.data.length, req.clean.size, 'results have fewer items than before');
      t.end();
    });
  });

  test('handle results array items independently', function(t) {
    var req = {
      clean: [
        {
          text: 'lampeter strasburg high school',
          size: 100
        },
        {
          text: 'lampeter strasburg high school',
          size: 3
        }
      ]
    };

    var res = {
      results: [
        { data: data },
        { data: data }
      ]
    };

    dedupe(req, res, function() {
      var firstExpectedCount = 9;
      t.equal(res.results[0].data.length, firstExpectedCount, 'first result: dupes are removed');
      t.equal(res.results[1].data.length, req.clean[1].size, 'second result: request size is heeded');
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
