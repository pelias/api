var proxyquire = require('proxyquire');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('validate fields', function(t) {
    var adminFields = require('../../../helper/adminFields').availableFields;
    t.assert(adminFields instanceof Array, 'adminFields is an array');
    t.assert(adminFields.length > 0, 'adminFields array is not empty');
    t.end();
  });
  test('validate fields', function(t) {
    var adminFields = require('../../../helper/adminFields').expectedFields;
    t.assert(adminFields instanceof Array, 'adminFields is an array');
    t.assert(adminFields.length > 0, 'adminFields array is not empty');
    t.end();
  });
};

module.exports.tests.lookupExistance = function(test, common) {
  test('all expected fields in schema', function(t) {

    var expectedFields = require('../../../helper/adminFields').expectedFields;
    var schemaMock = { mappings: { _default_: { properties: {} } } };

    // inject all expected fields into schema mock
    expectedFields.forEach(function (field) {
      schemaMock.mappings._default_.properties[field] = {};
    });

    var adminFields = proxyquire('../../../helper/adminFields', {'pelias-schema': schemaMock});

    t.deepEquals(adminFields.availableFields, adminFields.expectedFields, 'all expected fields are returned');
    t.end();
  });

  test('some expected fields in schema', function(t) {

    var expectedFields = require('../../../helper/adminFields').expectedFields.slice(0, 3);
    var schemaMock = { mappings: { _default_: { properties: {} } } };

    // inject all expected fields into schema mock
    expectedFields.forEach(function (field) {
      schemaMock.mappings._default_.properties[field] = {};
    });

    var adminFields = proxyquire('../../../helper/adminFields', {'pelias-schema': schemaMock});

    t.deepEquals(adminFields.availableFields, expectedFields, 'only matching expected fields are returned');
    t.end();
  });

  test('no expected fields in schema', function(t) {

    var schemaMock = { mappings: { _default_: { properties: { foo: {} } } } };

    var loggerMock = { get: function (name) {
      t.equal(name, 'api');
      return {
        error: function () {}
      };
    }};

    var adminFields = proxyquire('../../../helper/adminFields',
      {
        'pelias-schema': schemaMock,
        'pelias-logger': loggerMock
      });

    t.deepEquals([], adminFields.availableFields, 'no admin fields found');
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