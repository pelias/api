var check = require('check-types');
var type_mapping = require('../../../helper/type_mapping');

module.exports.tests = {};

module.exports.tests.interfaces = function(test, common) {
  test('types list', function(t) {
    t.ok(check.array(type_mapping.types), 'is array');
    t.ok(check.hasLength(type_mapping.types, 11), 'has correct number of elements');
    t.end();
  });

  test('type to source mapping', function(t) {
    t.ok(check.object(type_mapping.type_to_source), 'is object');
    t.ok(check.hasLength(Object.keys(type_mapping.type_to_source), 11), 'has correct number of elements');
    t.end();
  });

  test('type to layer mapping', function(t) {
    t.ok(check.object(type_mapping.type_to_layer), 'is object');
    t.ok(check.hasLength(Object.keys(type_mapping.type_to_layer), 11), 'has correct number of elements');
    t.end();
  });

  test('source to type mapping', function(t) {
    t.ok(check.object(type_mapping.source_to_type), 'is object');
    t.ok(check.hasLength(Object.keys(type_mapping.source_to_type), 8), 'has correct number of elements');
    t.end();
  });

  test('layer to type mapping', function(t) {
    t.ok(check.object(type_mapping.layer_to_type), 'is object');
    t.equal(Object.keys(type_mapping.layer_to_type).length, 8, 'has correct number of elements');
    t.end();
  });

  test('layer to type mapping (with aliases)', function(t) {
    t.ok(check.object(type_mapping.layer_with_aliases_to_type), 'is object');
    t.ok(check.hasLength(Object.keys(type_mapping.layer_with_aliases_to_type), 9), 'has correct number of elements');
    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('type_mapping: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
