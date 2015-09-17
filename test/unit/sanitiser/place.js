// @todo: refactor this test, it's pretty messy, brittle and hard to follow

var place  = require('../../../sanitiser/place'),
    sanitize = place.sanitize,
    middleware = place.middleware,
    types = require('../../../query/types'),
    delimiter = ':',
    defaultLengthError = function(input) { return 'invalid param \''+ input + '\': text length, must be >0'; },
    defaultFormatError = 'invalid: must be of the format type:id for ex: \'geoname:4163334\'',
    defaultError = 'invalid param \'ids\': text length, must be >0',
    defaultMissingTypeError = function(input) {
      var type = input.split(delimiter)[0];
      return type + ' is invalid. It must be one of these values - [' + types.join(', ') + ']'; },
    defaultClean = { ids: [ { id: '123', type: 'geoname' } ], private: false },
    inputs = {
      valid: [ 'geoname:1', 'osmnode:2', 'admin0:53', 'osmway:44', 'geoname:5' ],
      invalid: [ ':', '', '::', 'geoname:', ':234', 'gibberish:23' ]
    };

// these are the default values you would expect when no input params are specified.
var emptyClean = { ids: [], private: false };

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('sanitize interface', function(t) {
    t.equal(typeof sanitize, 'function', 'sanitize is a function');
    t.equal(sanitize.length, 2, 'sanitize interface');
    t.end();
  });
  test('middleware interface', function(t) {
    t.equal(typeof middleware, 'function', 'middleware is a function');
    t.equal(middleware.length, 3, 'sanitizee has a valid middleware');
    t.end();
  });
};

module.exports.tests.sanitize_id = function(test, common) {
  test('ids: invalid input', function(t) {
    inputs.invalid.forEach( function( input ){
      var req = { query: { ids: input } };
      sanitize(req, function( ){
        switch (req.errors[0]) {
          case defaultError:
            t.equal(req.errors[0], defaultError, input + ' is invalid input'); break;
          case defaultLengthError(input):
            t.equal(req.errors[0], defaultLengthError(input), input + ' is invalid (missing id/type)'); break;
          case defaultFormatError:
            t.equal(req.errors[0], defaultFormatError, input + ' is invalid (invalid format)'); break;
          case defaultMissingTypeError(input):
            t.equal(req.errors[0], defaultMissingTypeError(input), input + ' is an unknown type'); break;
          default: break;
        }
        t.deepEqual(req.clean, emptyClean, 'clean only has default values set');
      });
    });
    t.end();
  });

  test('ids: valid input', function(t) {
    inputs.valid.forEach( function( input ){
      var input_parts = input.split(delimiter);
      var expected = { ids: [ { id: input_parts[1], type: input_parts[0] } ], private: false };
      var req = { query: { ids: input } };
      sanitize(req, function(){
        t.deepEqual( req.errors, [], 'no error (' + input + ')' );
        t.deepEqual( req.clean, expected, 'clean set correctly (' + input + ')');
      });
    });
    t.end();
  });
};

module.exports.tests.sanitize_ids = function(test, common) {
  test('ids: invalid input with multiple values', function(t) {
    var req = { query: { ids: inputs.invalid.join(',') } };
    var expected = [
      'invalid param \'ids\': text length, must be >0',
      'invalid param \':\': text length, must be >0',
      'invalid param \'::\': text length, must be >0',
      'invalid param \'geoname:\': text length, must be >0',
      'invalid param \':234\': text length, must be >0',
      'gibberish is invalid. It must be one of these values - ' +
      '[geoname, osmnode, osmway, admin0, admin1, admin2, neighborhood, ' +
      'locality, local_admin, osmaddress, openaddresses]'
    ];
    sanitize(req, function(){
      t.deepEqual(req.errors, expected);
      t.deepEqual(req.clean, emptyClean, 'clean only has default values set');
    });
    t.end();
  });

  test('ids: valid input with multiple of values' , function(t) {
    var expected={};
    expected.ids = [];
    inputs.valid.forEach( function( input ){
      var input_parts = input.split(delimiter);
      expected.ids.push({ id: input_parts[1], type: input_parts[0] });
    });
    expected.private = false;
    var req = { query: { ids: inputs.valid.join(',') } };
    sanitize(req, function(){
      t.deepEqual( req.errors, [], 'no errors' );
      t.deepEqual( req.clean, expected, 'clean set correctly' );
    });
    t.end();
  });
};

module.exports.tests.array_of_ids = function(test, common) {
  // see https://github.com/pelias/api/issues/272
  test('array of ids sent by queryparser', function(t) {
    var req = { query: { ids: ['geoname:2', 'oswmay:4'] } };
    sanitize(req, function() {
      t.deepEqual( req.errors, ['`ids` parameter specified multiple times.'], 'error sent' );
      t.deepEqual( req.clean.ids, undefined, 'response is empty due to error' );
      t.end();
    });
  });
};

module.exports.tests.sanitize_private = function(test, common) {
  var invalid_values = [null, -1, 123, NaN, 'abc'];
  invalid_values.forEach(function(value) {
    test('invalid private param ' + value, function(t) {
      var req = { query: { ids:'geoname:123', 'private': value } };
      sanitize(req, function(){
        t.deepEqual( req.errors, [], 'no errors' );
        t.deepEqual( req.warnings, [], 'no warnings' );
        t.equal(req.clean.private, false, 'default private set (to false)');
        t.end();
      });
    });
  });

  var valid_values = ['true', true, 1];
  valid_values.forEach(function(value) {
    test('valid private param ' + value, function(t) {
      var req = { query: { ids:'geoname:123', 'private': value } };
      sanitize(req, function(){
        t.deepEqual( req.errors, [], 'no errors' );
        t.deepEqual( req.warnings, [], 'no warnings' );
        t.equal(req.clean.private, true, 'private set to true');
        t.end();
      });
    });
  });

  var valid_false_values = ['false', false, 0];
  valid_false_values.forEach(function(value) {
    test('test setting false explicitly ' + value, function(t) {
      var req = { query: { ids:'geoname:123', 'private': value } };
      sanitize(req, function(){
        t.deepEqual( req.errors, [], 'no errors' );
        t.deepEqual( req.warnings, [], 'no warnings' );
        t.equal(req.clean.private, false, 'private set to false');
        t.end();
      });
    });
  });

  test('test default behavior', function(t) {
    var req = { query: { ids:'geoname:123' } };
    sanitize(req, function(){
      t.deepEqual( req.errors, [], 'no errors' );
      t.deepEqual( req.warnings, [], 'no warnings' );
      t.equal(req.clean.private, false, 'private set to false');
      t.end();
    });
  });
};

module.exports.tests.multiple_ids = function(test, common) {
  var expected = { ids: [ { id: '1', type: 'geoname' }, { id: '2', type: 'osmnode' } ], private: false };
  var req = { query: { ids: 'geoname:1,osmnode:2' } };
  test('duplicate ids', function(t) {
    sanitize( req, function(){
      t.deepEqual( req.errors, [], 'no errors' );
      t.deepEqual( req.warnings, [], 'no warnings' );
      t.deepEqual(req.clean, expected, 'clean set correctly');
      t.end();
    });
  });
};

module.exports.tests.de_dupe = function(test, common) {
  var expected = { ids: [ { id: '1', type: 'geoname' }, { id: '2', type: 'osmnode' } ], private: false };
  var req = { query: { ids: 'geoname:1,osmnode:2,geoname:1' } };
  test('duplicate ids', function(t) {
    sanitize( req, function(){
      t.deepEqual( req.errors, [], 'no errors' );
      t.deepEqual( req.warnings, [], 'no warnings' );
      t.deepEqual(req.clean, expected, 'clean set correctly');
      t.end();
    });
  });
};

module.exports.tests.invalid_params = function(test, common) {
  test('invalid params', function(t) {
    var req = { query: {} };
    sanitize( req, function(){
      t.equal( req.errors[0], defaultError, 'handle invalid params gracefully');
      t.deepEqual( req.warnings, [], 'no warnings' );
      t.end();
    });
  });
};

module.exports.tests.middleware_success = function(test, common) {
  test('middleware success', function(t) {
    var req = { query: { ids: 'geoname:123' }};
    var next = function(){
      t.deepEqual( req.errors, [], 'no errors' );
      t.deepEqual( req.warnings, [], 'no warnings' );
      t.deepEqual(req.clean, defaultClean);
      t.end();
    };
    middleware( req, undefined, next );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('SANTIZE /place ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
