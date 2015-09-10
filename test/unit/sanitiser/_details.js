var search  = require('../../../sanitiser/search'),
    _sanitize = search.sanitize,
    sanitize = function(query, cb) { _sanitize({'query':query}, cb); };

module.exports.tests = {};

module.exports.tests.sanitize_details = function(test, common) {
  var invalid_values = [null, -1, 123, NaN, 'abc'];
  invalid_values.forEach(function(details) {
    test('invalid details param ' + details, function(t) {
      sanitize({ text: 'test', lat: 0, lon: 0, details: details }, function( err, clean ){
        t.equal(clean.details, false, 'default details set (to false)');
        t.end();
      });
    });
  });

  var valid_values = ['true', true, 1, '1', 'yes', 'y'];
  valid_values.forEach(function(details) {
    test('valid details param ' + details, function(t) {
      sanitize({ text: 'test', details: details }, function( err, clean ){
        t.equal(clean.details, true, 'details set to true');
        t.end();
      });
    });
  });

  var valid_false_values = ['false', false, 0, '0', 'no', 'n'];
  valid_false_values.forEach(function(details) {
    test('test setting false explicitly ' + details, function(t) {
      sanitize({ text: 'test', details: details }, function( err, clean ){
        t.equal(clean.details, false, 'details set to false');
        t.end();
      });
    });
  });

  test('test default behavior', function(t) {
    sanitize({ text: 'test' }, function( err, clean ){
      t.equal(clean.details, true, 'details set to true');
      t.end();
    });
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
