const decode_gid = require('../../../helper/decode_gid');

module.exports.tests = {};

module.exports.tests.valid_gid = function(test, common) {
  test('standard GID is decoded correctly', function(t) {
    const gid = decode_gid('whosonfirst:locality:123');

    t.equal(gid.source, 'whosonfirst');
    t.equal(gid.layer, 'locality');
    t.equal(gid.id, '123');
    t.end();
  });

  test('GID with colons in ID decoded correctly', function(t) {
    const gid = decode_gid('openaddresses:address:city_of_new_york:123');

    t.equal(gid.source, 'openaddresses');
    t.equal(gid.layer, 'address');
    t.equal(gid.id, 'city_of_new_york:123');
    t.end();
  });
};

module.exports.tests.invalid_gid = function(test, common) {
  test('gid without 3 parts returns undefined', function(t) {
    const gid = decode_gid('whosonfirst:locality');

    t.equal(gid, undefined);
    t.end();
  });

  test('gid without 3 full parts returns empty strings', function(t) {
    const gid = decode_gid('whosonfirst:locality:');

    t.equal(gid.source, 'whosonfirst');
    t.equal(gid.layer, 'locality');
    t.equal(gid.id, '');
    t.end();
  });
};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`decode GID: ${name}`, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
