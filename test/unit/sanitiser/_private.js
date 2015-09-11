var sanitize = require('../../../sanitiser/_private');

module.exports.tests = {};

module.exports.tests.sanitize_private = function(test, common) {
  var invalid_values = [null, -1, 123, NaN, 'abc'];
  invalid_values.forEach(function(privateValue) {
    test('invalid private param ' + privateValue, function(t) {
      var req = {query: { private: privateValue }};
      sanitize(req);
      t.equal(req.clean.private, false, 'default private set (to false)');
      t.end();
    });
  });

  var valid_values = ['true', true, 1, '1', 'yes', 'y'];
  valid_values.forEach(function(privateValue) {
    test('valid private param ' + privateValue, function(t) {
      var req = {query: { private: privateValue }};
      sanitize(req);
      t.equal(req.clean.private, true, 'private set to true');
      t.end();
    });
  });

  var valid_false_values = ['false', false, 0, '0', 'no', 'n'];
  valid_false_values.forEach(function(privateValue) {
    test('test setting false explicitly ' + privateValue, function(t) {
      var req = {query: { private: privateValue }};
      sanitize(req);
      t.equal(req.clean.private, false, 'private set to false');
      t.end();
    });
  });

  test('test default behavior', function(t) {
    var req = {query: {}};
    sanitize(req);
    t.equal(req.clean.private, true, 'private set to true');
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('SANTIZE _private ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
