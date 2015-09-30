var type_mapping = require('../../../helper/type_mapping');

var sanitize = require('../../../sanitiser/_targets')('layers', type_mapping.layer_with_aliases_to_type);

module.exports.tests = {};

module.exports.tests.sanitize_layers = function(test, common) {
  test('unspecified', function(t) {
    var messages = sanitize({ layers: undefined }, {});
    t.equal(messages.errors.length, 0, 'no errors');
    t.end();
  });
  test('invalid layer', function(t) {
    var raw = { layers: 'test_layer' };
    var clean = {};

    var messages = sanitize(raw, clean);

    var msg = ' is an invalid layers parameter. Valid options: ';
    t.equal(messages.errors.length, 1, 'errors set');
    t.true(messages.errors[0].match(msg), 'invalid layer requested');
    t.true(messages.errors[0].length > msg.length, 'invalid error message');
    t.end();
  });
  test('venue (alias) layer', function(t) {
    var venue_layers = ['geoname','osmnode','osmway'];
    var raw = { layers: 'venue' };
    var clean = {};

    sanitize(raw, clean);

    t.deepEqual(clean.types.from_layers, venue_layers, 'venue layers set');
    t.end();
  });
  test('coarse (alias) layer', function(t) {
    var admin_layers = ['admin0','admin1','admin2','neighborhood','locality','local_admin'];
    var raw = { layers: 'coarse' };
    var clean = {};

    sanitize(raw, clean);

    t.deepEqual(clean.types.from_layers, admin_layers, 'coarse layers set');
    t.end();
  });
  test('address (alias) layer', function(t) {
    var address_layers = ['osmaddress','openaddresses'];
    var raw = { layers: 'address' };
    var clean = {};

    sanitize(raw, clean);

    t.deepEqual(clean.types.from_layers, address_layers, 'address layers set');
    t.end();
  });
  test('venue alias layer plus regular layers', function(t) {
    var venue_layers = ['geoname','osmnode','osmway'];
    var reg_layers = ['admin0', 'admin1'];
    var raw = { layers: 'venue,country,region' };
    var clean = {};

    sanitize(raw, clean);

    t.deepEqual(clean.types.from_layers, venue_layers.concat(reg_layers), 'venue + regular layers');
    t.end();
  });
  test('coarse alias layer plus regular layers', function(t) {
    var admin_layers = ['admin0','admin1','admin2','neighborhood','locality','local_admin'];
    var reg_layers   = ['geoname', 'osmnode', 'osmway'];

    var raw = { layers: 'coarse,venue,country' };
    var clean = {};

    sanitize(raw, clean);

    t.deepEqual(clean.types.from_layers, admin_layers.concat(reg_layers), 'coarse + regular layers set');
    t.end();
  });
  test('address alias layer plus regular layers', function(t) {
    var address_layers = ['osmaddress','openaddresses'];
    var reg_layers   = ['admin0', 'locality'];

    var raw = { layers: 'address,country,locality' };
    var clean = {};

    sanitize(raw, clean);

    t.deepEqual(clean.types.from_layers, address_layers.concat(reg_layers), 'address + regular layers set');
    t.end();
  });
  test('alias layer plus regular layers (no duplicates)', function(t) {
    var venue_layers = ['geoname','osmnode','osmway','admin0'];
    var raw = { layers: 'venue,country' };
    var clean = {};

    sanitize(raw, clean);

    t.deepEqual(clean.types.from_layers, venue_layers, 'venue layers found (no duplicates)');
    t.end();
  });
  test('multiple alias layers (no duplicates)', function(t) {
    var alias_layers = ['geoname','osmnode','osmway','admin0','admin1','admin2','neighborhood','locality','local_admin'];
    var raw = { layers: 'venue,coarse' };
    var clean = {};

    sanitize(raw, clean);

    t.deepEqual(clean.types.from_layers, alias_layers, 'all layers found (no duplicates)');
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('SANTIZE _layers ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
