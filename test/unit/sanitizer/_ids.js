var sanitizer = require('../../../sanitizer/_ids')();

var delimiter = ':';
var type_mapping = require('../../../helper/type_mapping');

var formatError = function(input) {
  return 'id `' + input + ' is invalid: must be of the format source:layer:id for ex: \'geonames:venue:4163334\'';
};
var lengthError = 'invalid param \'ids\': length must be >0';

module.exports.tests = {};

module.exports.tests.invalid_ids = function(test, common) {
  test('invalid id: empty string', function(t) {
    var raw = { ids: '' };
    var clean = {};

    var messages = sanitizer.sanitize(raw, clean);

    t.equal(messages.errors[0], lengthError, 'ids length error returned');
    t.equal(clean.ids, undefined, 'ids unset in clean object');
    t.end();
  });

  test('invalid id: single colon', function(t) {
    var raw = { ids: ':' };
    var clean = {};

    var messages = sanitizer.sanitize(raw, clean);

    t.equal(messages.errors[0], formatError(':'), 'format error returned');
    t.equal(clean.ids, undefined, 'ids unset in clean object');
    t.end();
  });

  test('invalid id: double colon', function(t) {
    var raw = { ids: '::' };
    var clean = {};

    var messages = sanitizer.sanitize(raw, clean);

    t.equal(messages.errors[0], formatError('::'), 'format error returned');
    t.equal(clean.ids, undefined, 'ids unset in clean object');
    t.end();
  });

  test('invalid id: only type section present', function(t) {
    var raw = { ids: 'geoname:' };
    var clean = {};

    var messages = sanitizer.sanitize(raw, clean);

    t.equal(messages.errors[0], formatError('geoname:'), 'format error returned');
    t.equal(clean.ids, undefined, 'ids unset in clean object');
    t.end();
  });

  test('invalid id: only type id section present', function(t) {
    var raw = { ids: ':234' };
    var clean = {};

    var messages = sanitizer.sanitize(raw, clean);

    t.equal(messages.errors[0], formatError(':234'), 'format error returned');
    t.equal(clean.ids, undefined, 'ids unset in clean object');
    t.end();
  });

  test('invalid id: source name invalid', function(t) {
    var raw = { ids: 'invalidsource:venue:23' };
    var clean = {};
    var expected_error = 'invalidsource is invalid. It must be one of these values - [' +
      Object.keys(type_mapping.source_mapping).join(', ') + ']';

    var messages = sanitizer.sanitize(raw, clean);

    t.equal(messages.errors[0], expected_error, 'format error returned');
    t.equal(clean.ids, undefined, 'ids unset in clean object');
    t.end();
  });

  test('invalid id: old style 2 part id', function(t) {
    var raw = { ids: 'geonames:23' };
    var clean = {};

    var messages = sanitizer.sanitize(raw, clean);

    t.equal(messages.errors[0], formatError('geonames:23'), 'format error returned');
    t.equal(clean.ids, undefined, 'ids unset in clean object');
    t.end();
  });
};

module.exports.tests.valid_ids = function(test, common) {
  test('ids: valid input (openaddresses)', function(t) {
    var raw = { ids: 'openaddresses:address:20' };
    var clean = {};

    var messages = sanitizer.sanitize( raw, clean );

    var expected_ids = [{
      source: 'openaddresses',
      layer: 'address',
      id: '20',
    }];
    t.deepEqual( messages.errors, [], ' no errors');
    t.deepEqual( clean.ids, expected_ids, 'single type value returned');
    t.end();
  });

test('ids: valid short input (openaddresses)', function(t) {
    var raw = { ids: 'oa:address:20' };
    var clean = {};

    var messages = sanitizer.sanitize( raw, clean );

    var expected_ids = [{
      source: 'openaddresses',
      layer: 'address',
      id: '20',
    }];
    t.deepEqual( messages.errors, [], ' no errors');
    t.deepEqual( clean.ids, expected_ids, 'single type value returned');
    t.end();
  });

  test('ids: valid input (osm)', function(t) {
    var raw = { ids: 'openstreetmap:venue:node:500' };
    var clean = {};
    var expected_ids = [{
      source: 'openstreetmap',
      layer: 'venue',
      id: 'node:500',
    }];

    var messages = sanitizer.sanitize( raw, clean );

    t.deepEqual( messages.errors, [], ' no errors');
    t.deepEqual( clean.ids, expected_ids, 'osm has node: or way: in id field');
    t.end();
  });

  test('ids: valid short input (osm)', function(t) {
    var raw = { ids: 'osm:venue:node:500' };
    var clean = {};
    var expected_ids = [{
      source: 'openstreetmap',
      layer: 'venue',
      id: 'node:500',
    }];

    var messages = sanitizer.sanitize( raw, clean );

    t.deepEqual( messages.errors, [], ' no errors');
    t.deepEqual( clean.ids, expected_ids, 'osm has node: or way: in id field');
    t.end();
  });
};

module.exports.tests.multiple_ids = function(test, common) {
  test('multiple ids', function(t) {
    var raw = { ids: 'geonames:venue:1,openstreetmap:address:way:2' };
    var clean = {};

    var messages = sanitizer.sanitize( raw, clean);

    var expected_ids = [ {
      source: 'geonames',
      layer: 'venue',
      id: '1'
    }, {
      source: 'openstreetmap',
      layer: 'address',
      id: 'way:2'
    } ];

    t.deepEqual( messages.errors, [], 'no errors' );
    t.deepEqual( messages.warnings, [], 'no warnings' );
    t.deepEqual(clean.ids, expected_ids, 'clean set correctly');
    t.end();
  });
};

module.exports.tests.de_dupe = function(test, common) {
  test('duplicate ids', function(t) {
    var raw = { ids: 'geonames:venue:1,openstreetmap:venue:node:2,geonames:venue:1' };
    var clean = {};

    var messages = sanitizer.sanitize( raw, clean );

    var expected_ids = [ {
      source: 'geonames',
      layer: 'venue',
      id: '1'
    }, {
      source: 'openstreetmap',
      layer: 'venue',
      id: 'node:2'
    } ];
    t.deepEqual( messages.errors, [], 'no errors' );
    t.deepEqual( messages.warnings, [], 'no warnings' );
    t.deepEqual(clean.ids, expected_ids, 'clean set correctly');
    t.end();
  });
};

module.exports.tests.valid_Parameters = function(test, common) {
  test('return an array of expected parameters in object form for validation', (t) => {
    const expected = [{ name: 'ids' }];
    const validParameters = sanitizer.expected();
    t.deepEquals(validParameters, expected);
    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('SANITIZE _ids ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
