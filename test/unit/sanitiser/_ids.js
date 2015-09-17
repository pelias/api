var sanitize = require('../../../sanitiser/_ids');

var delimiter = ':';
var types = require('../../../query/types');
var inputs = {
  valid: [ 'geoname:1', 'osmnode:2', 'admin0:53', 'osmway:44', 'geoname:5' ],
  invalid: [ ':', '', '::', 'geoname:', ':234', 'gibberish:23' ]
};
var defaultLengthError = function(input) { return 'invalid param \''+ input + '\': text length, must be >0'; },
  defaultFormatError = 'invalid: must be of the format type:id for ex: \'geoname:4163334\'',
  defaultError = 'invalid param \'ids\': text length, must be >0',
  defaultMissingTypeError = function(input) {
    var type = input.split(delimiter)[0];
    return type + ' is invalid. It must be one of these values - [' + types.join(', ') + ']';
  };

module.exports.tests = {};

module.exports.tests.sanitize_id = function(test, common) {
  test('ids: invalid input', function(t) {
    inputs.invalid.forEach( function( input ){
      var raw = { ids: input };
      var clean = {};

      var messages = sanitize(raw, clean);

      switch (messages.errors[0]) {
        case defaultError:
          t.equal(messages.errors[0], defaultError, input + ' is invalid input'); break;
        case defaultLengthError(input):
          t.equal(messages.errors[0], defaultLengthError(input), input + ' is invalid (missing id/type)'); break;
        case defaultFormatError:
          t.equal(messages.errors[0], defaultFormatError, input + ' is invalid (invalid format)'); break;
        case defaultMissingTypeError(input):
          t.equal(messages.errors[0], defaultMissingTypeError(input), input + ' is an unknown type'); break;
        default:
          t.fail('error didn\'t match');
        break;
      }
      t.equal(clean.ids, undefined, 'clean has no ids value set');
    });
    t.end();
  });

  test('ids: valid input', function(t) {
    inputs.valid.forEach( function( input ){
      var input_parts = input.split(delimiter);
      var expected_clean = { ids: [ { id: input_parts[1], type: input_parts[0] } ]};
      var raw = {  ids: input };
      var clean = {};

      var messages = sanitize( raw, clean );

      t.deepEqual( messages.errors, [], 'no error (' + input + ')' );
      t.deepEqual( clean, expected_clean, 'clean set correctly (' + input + ')');
    });
    t.end();
  });
};

module.exports.tests.sanitize_ids = function(test, common) {
  test('ids: invalid input with multiple values', function(t) {
    var raw = { ids: inputs.invalid.join(',') };
    var expected_errors = [
      'invalid param \'ids\': text length, must be >0',
      'invalid param \':\': text length, must be >0',
      'invalid param \'::\': text length, must be >0',
      'invalid param \'geoname:\': text length, must be >0',
      'invalid param \':234\': text length, must be >0',
      'gibberish is invalid. It must be one of these values - ' +
      '[geoname, osmnode, osmway, admin0, admin1, admin2, neighborhood, ' +
      'locality, local_admin, osmaddress, openaddresses]'
    ];
    var clean = {};

    var messages = sanitize( raw, clean );

    t.deepEqual(messages.errors, expected_errors);
    t.equal(clean.ids, undefined, 'clean has no ids value set');
    t.end();
  });

  test('ids: valid input with multiple of values' , function(t) {
    var expected_clean={
      ids: [],
    };
    inputs.valid.forEach( function( input ){
      var input_parts = input.split(delimiter);
      expected_clean.ids.push({ id: input_parts[1], type: input_parts[0] });
    });
    var raw = { ids: inputs.valid.join(',') };
    var clean = {};

    var messages = sanitize( raw, clean );

    t.deepEqual( messages.errors, [], 'no errors' );
    t.deepEqual( clean, expected_clean, 'clean set correctly' );
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
  test('duplicate ids', function(t) {
    var expected_clean = { ids: [ { id: '1', type: 'geoname' }, { id: '2', type: 'osmnode' } ] };
    var raw = { ids: 'geoname:1,osmnode:2' };
    var clean = {};

    var messages = sanitize( raw, clean);

    t.deepEqual( messages.errors, [], 'no errors' );
    t.deepEqual( messages.warnings, [], 'no warnings' );
    t.deepEqual(clean, expected_clean, 'clean set correctly');
    t.end();
  });
};

module.exports.tests.de_dupe = function(test, common) {
  test('duplicate ids', function(t) {
    var expected_clean = { ids: [ { id: '1', type: 'geoname' }, { id: '2', type: 'osmnode' } ]};
    var raw = { ids: 'geoname:1,osmnode:2,geoname:1' };
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
