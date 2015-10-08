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

  test('\'osm\' and \'openstreetmap\' sources should only successfully map to \'venue\' and \'address\' layers', function(t) {
    t.deepEquals(type_mapping.source_and_layer_to_type('osm', 'venue'), ['osmnode', 'osmway']);
    t.deepEquals(type_mapping.source_and_layer_to_type('osm', 'address'), ['osmaddress']);
    t.deepEquals(type_mapping.source_and_layer_to_type('osm', 'country'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('osm', 'region'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('osm', 'county'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('osm', 'locality'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('osm', 'localadmin'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('osm', 'neighbourhood'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('osm', 'coarse'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('openstreetmap', 'venue'), ['osmnode', 'osmway']);
    t.deepEquals(type_mapping.source_and_layer_to_type('openstreetmap', 'address'), ['osmaddress']);
    t.deepEquals(type_mapping.source_and_layer_to_type('openstreetmap', 'country'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('openstreetmap', 'region'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('openstreetmap', 'county'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('openstreetmap', 'locality'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('openstreetmap', 'localadmin'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('openstreetmap', 'neighbourhood'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('openstreetmap', 'coarse'), []);
    t.end();
  });

  test('\'gn\' and \'geonames\' sources should only successfully map to \'venue\' layers', function(t) {
    t.deepEquals(type_mapping.source_and_layer_to_type('gn', 'venue'), ['geoname']);
    t.deepEquals(type_mapping.source_and_layer_to_type('gn', 'address'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('gn', 'country'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('gn', 'region'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('gn', 'county'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('gn', 'locality'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('gn', 'localadmin'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('gn', 'neighbourhood'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('gn', 'coarse'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('geonames', 'venue'), ['geoname']);
    t.deepEquals(type_mapping.source_and_layer_to_type('geonames', 'address'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('geonames', 'country'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('geonames', 'region'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('geonames', 'county'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('geonames', 'locality'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('geonames', 'localadmin'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('geonames', 'neighbourhood'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('geonames', 'coarse'), []);
    t.end();
  });

  test('\'oa\' and \'openaddresses\' sources should only successfully map to \'address\' layer', function(t) {
    t.deepEquals(type_mapping.source_and_layer_to_type('oa', 'venue'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('oa', 'address'), ['openaddresses']);
    t.deepEquals(type_mapping.source_and_layer_to_type('oa', 'country'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('oa', 'region'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('oa', 'county'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('oa', 'locality'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('oa', 'localadmin'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('oa', 'neighbourhood'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('oa', 'coarse'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('openaddresses', 'venue'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('openaddresses', 'address'), ['openaddresses']);
    t.deepEquals(type_mapping.source_and_layer_to_type('openaddresses', 'country'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('openaddresses', 'region'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('openaddresses', 'county'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('openaddresses', 'locality'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('openaddresses', 'localadmin'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('openaddresses', 'neighbourhood'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('openaddresses', 'coarse'), []);
    t.end();
  });

  test('\'qs\' and \'quattroshapes\' sources should only successfully map to \'address\' layer', function(t) {
    t.deepEquals(type_mapping.source_and_layer_to_type('qs', 'venue'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('qs', 'address'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('qs', 'country'), ['admin0']);
    t.deepEquals(type_mapping.source_and_layer_to_type('qs', 'region'), ['admin1']);
    t.deepEquals(type_mapping.source_and_layer_to_type('qs', 'county'), ['admin2']);
    t.deepEquals(type_mapping.source_and_layer_to_type('qs', 'locality'), ['locality']);
    t.deepEquals(type_mapping.source_and_layer_to_type('qs', 'localadmin'), ['local_admin']);
    t.deepEquals(type_mapping.source_and_layer_to_type('qs', 'neighbourhood'), ['neighborhood']);
    t.deepEquals(type_mapping.source_and_layer_to_type('qs', 'coarse'),
      ['admin0','admin1','admin2','neighborhood','locality','local_admin']);
    t.deepEquals(type_mapping.source_and_layer_to_type('quattroshapes', 'venue'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('quattroshapes', 'address'), []);
    t.deepEquals(type_mapping.source_and_layer_to_type('quattroshapes', 'country'), ['admin0']);
    t.deepEquals(type_mapping.source_and_layer_to_type('quattroshapes', 'region'), ['admin1']);
    t.deepEquals(type_mapping.source_and_layer_to_type('quattroshapes', 'county'), ['admin2']);
    t.deepEquals(type_mapping.source_and_layer_to_type('quattroshapes', 'locality'), ['locality']);
    t.deepEquals(type_mapping.source_and_layer_to_type('quattroshapes', 'localadmin'), ['local_admin']);
    t.deepEquals(type_mapping.source_and_layer_to_type('quattroshapes', 'neighbourhood'), ['neighborhood']);
    t.deepEquals(type_mapping.source_and_layer_to_type('quattroshapes', 'coarse'),
      ['admin0','admin1','admin2','neighborhood','locality','local_admin']);
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
