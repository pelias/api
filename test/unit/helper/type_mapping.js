var check = require('check-types');
var type_mapping = require('../../../helper/type_mapping');

module.exports.tests = {};

module.exports.tests.interfaces = function(test, common) {
  test('basic layer mapping', function(t) {
    t.deepEquals(type_mapping.layer_mapping.venue, ['venue']);
    t.deepEquals(type_mapping.layer_mapping.address, ['address']);
    t.end();
  });

  test('alias layer mapping', function(t) {
    t.deepEquals(type_mapping.layer_mapping.coarse,
                 [ 'continent', 'country', 'dependency', 'macroregion',
                   'region', 'locality', 'localadmin', 'macrocounty', 'county', 'macrohood',
                   'borough', 'neighbourhood', 'microhood', 'disputed', 'postalcode' ]);
    t.end();
  });

  test('basic source mapping', function(t) {
    t.deepEquals(type_mapping.source_mapping.osm, ['openstreetmap']);
    t.deepEquals(type_mapping.source_mapping.openaddresses, ['openaddresses']);
    t.end();
  });

  test('alias source mapping', function(t) {
    t.deepEquals(type_mapping.source_mapping.openstreetmap, ['openstreetmap']);
    t.deepEquals(type_mapping.source_mapping.wof, ['whosonfirst']);
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
