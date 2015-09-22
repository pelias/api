var sanitize = require('../../../sanitiser/_ids');

var delimiter = ':';
var type_mapping = require('../../../helper/type_mapping');
var inputs = {
  valid: [ 'geoname:1', 'osmnode:2', 'admin0:53', 'osmway:44', 'geoname:5' ],
  invalid: [ ':', '', '::', 'geoname:', ':234', 'gibberish:23' ]
};

var formatError = function(input) {
  return 'id `' + input + ' is invalid: must be of the format source:layer:id for ex: \'geonames:venue:4163334\'';
};
var lengthError = 'invalid param \'ids\': length must be >0';

module.exports.tests = {};

module.exports.tests.invalid_ids = function(test, common) {
  test('invalid id: empty string', function(t) {
    var raw = { ids: '' };
    var clean = {};

    var messages = sanitize(raw, clean);

    t.equal(messages.errors[0], lengthError, 'ids length error returned');
    t.equal(clean.ids, undefined, 'ids unset in clean object');
    t.end();
  });

  test('invalid id: single colon', function(t) {
    var raw = { ids: ':' };
    var clean = {};

    var messages = sanitize(raw, clean);

    t.equal(messages.errors[0], formatError(':'), 'format error returned');
    t.equal(clean.ids, undefined, 'ids unset in clean object');
    t.end();
  });

  test('invalid id: double colon', function(t) {
    var raw = { ids: '::' };
    var clean = {};

    var messages = sanitize(raw, clean);

    t.equal(messages.errors[0], formatError('::'), 'format error returned');
    t.equal(clean.ids, undefined, 'ids unset in clean object');
    t.end();
  });

  test('invalid id: only type section present', function(t) {
    var raw = { ids: 'geoname:' };
    var clean = {};

    var messages = sanitize(raw, clean);

    t.equal(messages.errors[0], formatError('geoname:'), 'format error returned');
    t.equal(clean.ids, undefined, 'ids unset in clean object');
    t.end();
  });

  test('invalid id: only type id section present', function(t) {
    var raw = { ids: ':234' };
    var clean = {};

    var messages = sanitize(raw, clean);

    t.equal(messages.errors[0], formatError(':234'), 'format error returned');
    t.equal(clean.ids, undefined, 'ids unset in clean object');
    t.end();
  });

  test('invalid id: source name invalid', function(t) {
    var raw = { ids: 'invalidsource:venue:23' };
    var clean = {};
    var expected_error = 'invalidsource is invalid. It must be one of these values - [' + type_mapping.sources.join(', ') + ']';

    var messages = sanitize(raw, clean);

    t.equal(messages.errors[0], expected_error, 'format error returned');
    t.equal(clean.ids, undefined, 'ids unset in clean object');
    t.end();
  });

  test('invalid id: old style 2 part id', function(t) {
    var raw = { ids: 'geonames:23' };
    var clean = {};

    var messages = sanitize(raw, clean);

    t.equal(messages.errors[0], formatError('geonames:23'), 'format error returned');
    t.equal(clean.ids, undefined, 'ids unset in clean object');
    t.end();
  });
};

module.exports.tests.valid_ids = function(test, common) {
  test('ids: valid input (openaddresses)', function(t) {
    var raw = { ids: 'openaddresses:address:20' };
    var clean = {};
    var expected_ids = [{
      id: '20',
      types: [ 'openaddresses' ]
    }];

    var messages = sanitize( raw, clean );

    t.deepEqual( messages.errors, [], ' no errors');
    t.deepEqual( clean.ids, expected_ids, 'single type value returned');
    t.end();
  });

  test('ids: valid input (osm)', function(t) {
    var raw = { ids: 'osm:venue:500' };
    var clean = {};
    var expected_ids = [{
      id: '500',
      types: [ 'osmnode', 'osmway' ]
    }];

    var messages = sanitize( raw, clean );

    t.deepEqual( messages.errors, [], ' no errors');
    t.deepEqual( clean.ids, expected_ids, 'osm could be two types, but that\'s ok');
    t.end();
  });
};

module.exports.tests.array_of_ids = function(test, common) {
  // see https://github.com/pelias/api/issues/272
  test('array of ids sent by queryparser', function(t) {
    var raw = { ids: ['geoname:2', 'oswmay:4'] };
    var clean = {};

    var messages = sanitize( raw, clean);

    t.deepEqual( messages.errors, ['`ids` parameter specified multiple times.'], 'error sent' );
    t.deepEqual( clean.ids, undefined, 'response is empty due to error' );
    t.end();
  });
};

module.exports.tests.multiple_ids = function(test, common) {
  test('multiple ids', function(t) {
    var raw = { ids: 'geonames:venue:1,osm:venue:2' };
    var clean = {};
    var expected_clean = { ids: [ { id: '1', types: [ 'geoname' ] }, { id: '2', types: [ 'osmnode', 'osmway' ] } ] };

    var messages = sanitize( raw, clean);

    t.deepEqual( messages.errors, [], 'no errors' );
    t.deepEqual( messages.warnings, [], 'no warnings' );
    t.deepEqual(clean, expected_clean, 'clean set correctly');
    t.end();
  });
};

module.exports.tests.de_dupe = function(test, common) {
  test('duplicate ids', function(t) {
    var expected_clean = { ids: [ { id: '1', types: [ 'geoname' ] }, { id: '2', types: [ 'osmnode', 'osmway' ] } ] };
    var raw = { ids: 'geonames:venue:1,osm:venue:2,geonames:venue:1' };
    var clean = {};

    var messages = sanitize( raw, clean );

    t.deepEqual( messages.errors, [], 'no errors' );
    t.deepEqual( messages.warnings, [], 'no warnings' );
    t.deepEqual(clean, expected_clean, 'clean set correctly');
    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('SANTIZE _ids ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
