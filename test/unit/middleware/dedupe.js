var data = require('../fixture/dedupe_elasticsearch_results');
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

    var expectedCount = 7;
    dedupe(req, res, function () {
      t.equal(res.data.length, expectedCount, 'results have fewer items than before');
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
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('[middleware] dedupe: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
