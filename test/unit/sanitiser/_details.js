var sanitize = require('../../../sanitiser/_details');

module.exports.tests = {};

module.exports.tests.sanitize_details = function(test, common) {
  var invalid_values = [null, -1, 123, NaN, 'abc'];
  invalid_values.forEach(function(detailsValue) {
    test('invalid details param ' + detailsValue, function(t) {
      var req = {query: { details: detailsValue }};
      sanitize(req);
      t.equal(req.clean.details, false, 'default details set (to false)');
      t.end();
    });
  });

  var valid_values = ['true', true, 1, '1', 'yes', 'y'];
  valid_values.forEach(function(detailsValue) {
    test('valid details param ' + detailsValue, function(t) {
      var req = {query: { details: detailsValue }};
      sanitize(req);
      t.equal(req.clean.details, true, 'details set to true');
      t.end();
    });
  });

  var valid_false_values = ['false', false, 0, '0', 'no', 'n'];
  valid_false_values.forEach(function(detailsValue) {
    test('test setting false explicitly ' + detailsValue, function(t) {
      var req = {query: { details: detailsValue }};
      sanitize(req);
      t.equal(req.clean.details, false, 'details set to false');
      t.end();
    });
  });

  test('test behavior with no parameter set and default false', function(t) {
    var req = {query: {}};
    sanitize(req, 0);
    t.equal(req.clean.details, false, 'details set to false');
    t.end();
  });

  test('test behavior with no parameter set and default true', function(t) {
    var req = {query: {}};
    sanitize(req, 1);
    t.equal(req.clean.details, true, 'details set to true');
    t.end();
  });

  test('test default behavior', function(t) {
    var req = {query: {}};
    sanitize(req);
    t.equal(req.clean.details, true, 'details set to true');
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('SANTIZE _details ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
