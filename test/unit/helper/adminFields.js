var adminFields = require('../../../helper/adminFields');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('validate fields', function(t) {
    t.assert(adminFields instanceof Function, 'adminFields is a function');
    t.assert(adminFields() instanceof Array, 'adminFields() returns an array');
    t.assert(adminFields().length > 0, 'adminFields array is not empty');
    t.end();
  });
};

module.exports.tests.lookupExistance = function(test, common) {
  test('all expected fields in schema', function(t) {

    var expectedFields = [
      'one',
      'two',
      'three',
      'four'
    ];
    var schema = { mappings: { _default_: { properties: {} } } };

    // inject all expected fields into schema mock
    expectedFields.forEach(function (field) {
      schema.mappings._default_.properties[field] = {};
    });

    var res = adminFields(schema, expectedFields);

    t.deepEquals(res, expectedFields, 'all expected fields are returned');
    t.end();
  });

  test('some expected fields in schema', function(t) {

    var expectedFields = [
      'one',
      'two',
      'three',
      'four'
    ];
    var schema = { mappings: { _default_: { properties: {} } } };

    // inject only some of the expected fields into schema mock
    expectedFields.slice(0, 3).forEach(function (field) {
      schema.mappings._default_.properties[field] = {};
    });

    var res = adminFields(schema, expectedFields);

    t.deepEquals(res, expectedFields.slice(0, 3), 'only matching expected fields are returned');
    t.end();
  });

  test('no expected fields in schema', function(t) {

    var schema = { mappings: { _default_: { properties: { foo: {} } } } };

    var logErrorCalled = false;
    var logger = {
      error: function () {
        logErrorCalled = true;
      }};

    var res = adminFields(schema, undefined, logger);

    t.deepEquals(res, [], 'no admin fields found');
    t.assert(logErrorCalled, 'log error called');
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('adminFields: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};