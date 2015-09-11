
var sanitize = require('../../../sanitiser/_targets')('layers', require('../../../query/layers'));

module.exports.tests = {};

module.exports.tests.sanitize_layers = function(test, common) {
  test('unspecified', function(t) {
    var res = sanitize({ query: { layers: undefined } });
    t.equal(res.error, false);
    t.end();
  });
  test('invalid layer', function(t) {
    var req = { query: { layers: 'test_layer' } };
    var res = sanitize(req);
    var msg = ' is an invalid layers parameter. Valid options: ';
    t.true(res.error, 'error flag set');
    t.true(res.message.match(msg), 'invalid layer requested');
    t.true(res.message.length > msg.length, 'invalid error message');
    t.end();
  });
  test('venue (alias) layer', function(t) {
    var venue_layers = ['geoname','osmnode','osmway'];
    var req = { query: { layers: 'venue' } };
    sanitize(req);
    t.deepEqual(req.clean.types.from_layers, venue_layers, 'venue layers set');
    t.end();
  });
  test('coarse (alias) layer', function(t) {
    var admin_layers = ['admin0','admin1','admin2','neighborhood','locality','local_admin'];
    var req = { query: { layers: 'coarse' } };
    sanitize(req);
    t.deepEqual(req.clean.types.from_layers, admin_layers, 'coarse layers set');
    t.end();
  });
  test('address (alias) layer', function(t) {
    var address_layers = ['osmaddress','openaddresses'];
    var req = { query: { layers: 'address' } };
    sanitize(req);
    t.deepEqual(req.clean.types.from_layers, address_layers, 'address layers set');
    t.end();
  });
  test('venue alias layer plus regular layers', function(t) {
    var venue_layers = ['geoname','osmnode','osmway'];
    var reg_layers = ['admin0', 'admin1'];
    var req = { query: { layers: 'venue,country,region' } };
    sanitize(req);
    t.deepEqual(req.clean.types.from_layers, venue_layers.concat(reg_layers), 'venue + regular layers');
    t.end();
  });
  test('coarse alias layer plus regular layers', function(t) {
    var admin_layers = ['admin0','admin1','admin2','neighborhood','locality','local_admin'];
    var reg_layers   = ['geoname', 'osmnode', 'osmway'];

    var req = { query: { layers: 'coarse,venue,country' } };
    sanitize(req);
    t.deepEqual(req.clean.types.from_layers, admin_layers.concat(reg_layers), 'coarse + regular layers set');
    t.end();
  });
  test('address alias layer plus regular layers', function(t) {
    var address_layers = ['osmaddress','openaddresses'];
    var reg_layers   = ['admin0', 'locality'];

    var req = { query: { layers: 'address,country,locality' } };
    sanitize(req);
    t.deepEqual(req.clean.types.from_layers, address_layers.concat(reg_layers), 'address + regular layers set');
    t.end();
  });
  test('alias layer plus regular layers (no duplicates)', function(t) {
    var venue_layers = ['geoname','osmnode','osmway','admin0'];
    var req = { query: { layers: 'venue,country' } };
    sanitize(req);
    t.deepEqual(req.clean.types.from_layers, venue_layers, 'venue layers found (no duplicates)');
    t.end();
  });
  test('multiple alias layers (no duplicates)', function(t) {
    var alias_layers = ['geoname','osmnode','osmway','admin0','admin1','admin2','neighborhood','locality','local_admin'];
    var req = { query: { layers: 'venue,coarse' } };
    sanitize(req);
    t.deepEqual(req.clean.types.from_layers, alias_layers, 'all layers found (no duplicates)');
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
