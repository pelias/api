var groups = require('../../../sanitizer/_groups');

module.exports.tests = {};

module.exports.tests.optional_group = function(test, common) {
  test('optional group none present ', function(t) {
    var object = {};
    t.doesNotThrow(function() {
      var present = groups.optional(object, [ 'a', 'b' ]);
      t.equal(present, false, 'group reported not present');
    });
    t.end();
  });

  test('optional group all present ', function(t) {
    var object = { 'a': 5, 'b': 9 };
    t.doesNotThrow(function() {
      var present = groups.optional(object, [ 'a', 'b' ]);
      t.equal(present, true, 'group reported present');
    });
    t.end();
  });

  test('optional group some present ', function(t) {
    var object = { 'b': 9 };
    t.throws(function() {
      groups.optional(object, [ 'a', 'b' ]);
    }, new RegExp('parameters a and b must both be specified'));
    t.end();
  });

  test('optional group some present (larger group) ', function(t) {
    var object = { 'b': 9, 'd': 5 };
    t.throws(function() {
      groups.optional(object, [ 'a', 'b', 'c', 'd', 'e' ]);
    }, new RegExp('parameters a, b, c, d and e must all be specified'));
    t.end();
  });
};

module.exports.tests.required_group = function(test, common) {
  test('required group none present ', function(t) {
    var object = {};
    t.throws(function() {
      groups.required(object, [ 'a', 'b' ]);
    }, new RegExp('parameters a and b must both be specified'));
    t.end();
  });

  test('required group all present ', function(t) {
    var object = { 'a': 5, 'b': 9 };
    t.doesNotThrow(function() {
      groups.required(object, [ 'a', 'b' ]);
    });
    t.end();
  });

  test('required group some present ', function(t) {
    var object = { 'b': 9 };
    t.throws(function() {
      groups.required(object, [ 'a', 'b' ]);
    }, new RegExp('parameters a and b must both be specified'));
    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('SANTIZE _groups ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
