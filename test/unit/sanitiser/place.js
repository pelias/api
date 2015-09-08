
var place  = require('../../../sanitiser/place'),
    _sanitize = place.sanitize,
    middleware = place.middleware,
    types = require('../../../query/types'),
    delimiter = ':',
    defaultLengthError = function(input) { return 'invalid param \''+ input + '\': text length, must be >0'; },
    defaultFormatError = 'invalid: must be of the format type:id for ex: \'geoname:4163334\'',
    defaultError = 'invalid param \'id\': text length, must be >0',
    defaultMissingTypeError = function(input) {
      var type = input.split(delimiter)[0];
      return type + ' is invalid. It must be one of these values - [' + types.join(', ') + ']'; },
    defaultClean = { ids: [ { id: '123', type: 'geoname' } ], details: true },
    sanitize = function(query, cb) { _sanitize({'query':query}, cb); },
    inputs = {
      valid: [ 'geoname:1', 'osmnode:2', 'admin0:53', 'osmway:44', 'geoname:5' ],
      invalid: [ ':', '', '::', 'geoname:', ':234', 'gibberish:23' ]
    };

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
  test('invalid input', function(t) {
    inputs.invalid.forEach( function( input ){
      sanitize({ id: input }, function( err, clean ){
        switch (err) {
          case defaultError:
            t.equal(err, defaultError, input + ' is invalid input'); break;
          case defaultLengthError(input):
            t.equal(err, defaultLengthError(input), input + ' is invalid (missing id/type)'); break;
          case defaultFormatError:
            t.equal(err, defaultFormatError, input + ' is invalid (invalid format)'); break;
          case defaultMissingTypeError(input):
            t.equal(err, defaultMissingTypeError(input), input + ' is an unknown type'); break;
          default: break;
        }
        t.equal(clean, undefined, 'clean not set');
      });
    });
    t.end();
  });

  test('valid input', function(t) {
    inputs.valid.forEach( function( input ){
      var input_parts = input.split(delimiter);
      var expected = { ids: [ { id: input_parts[1], type: input_parts[0] } ], details: true };
      sanitize({ id: input }, function( err, clean ){
        t.equal(err, undefined, 'no error (' + input + ')' );
        t.deepEqual(clean, expected, 'clean set correctly (' + input + ')');
      });
    });
    t.end();
  });
};


module.exports.tests.sanitize_ids = function(test, common) {
  test('invalid input', function(t) {
    sanitize({ id: inputs.invalid }, function( err, clean ){
      var input = inputs.invalid[0]; // since it breaks on the first invalid element
      switch (err) {
        case defaultError:
          t.equal(err, defaultError, input + ' is invalid input'); break;
        case defaultLengthError(input):
          t.equal(err, defaultLengthError(input), input + ' is invalid (missing id/type)'); break;
        case defaultFormatError:
          t.equal(err, defaultFormatError, input + ' is invalid (invalid format)'); break;
        case defaultMissingTypeError(input):
          t.equal(err, defaultMissingTypeError(input), input + ' is an unknown type'); break;
        default: break;
      }
      t.equal(clean, undefined, 'clean not set');
    });
    t.end();
  });

  test('valid input', function(t) {
    var expected={};
    expected.ids = [];
    inputs.valid.forEach( function( input ){
      var input_parts = input.split(delimiter);
      expected.ids.push({ id: input_parts[1], type: input_parts[0] });
    });
    expected.details = true;
    sanitize({ id: inputs.valid }, function( err, clean ){
      t.equal(err, undefined, 'no error' );
      t.deepEqual(clean, expected, 'clean set correctly');
    });
    t.end();
  });
};

module.exports.tests.sanitize_details = function(test, common) {
  var invalid_values = [null, -1, 123, NaN, 'abc'];
  invalid_values.forEach(function(details) {
    test('invalid details param ' + details, function(t) {
      sanitize({ id:'geoname:123', details: details }, function( err, clean ){
        t.equal(clean.details, false, 'default details set (to false)');
        t.end();
      });
    });
  });

  var valid_values = ['true', true, 1];
  valid_values.forEach(function(details) {
    test('valid details param ' + details, function(t) {
      sanitize({ id:'geoname:123', details: details }, function( err, clean ){
        t.equal(clean.details, true, 'details set to true');
        t.end();
      });
    });
  });

  var valid_false_values = ['false', false, 0];
  valid_false_values.forEach(function(details) {
    test('test setting false explicitly ' + details, function(t) {
      sanitize({ id:'geoname:123', details: details }, function( err, clean ){
        t.equal(clean.details, false, 'details set to false');
        t.end();
      });
    });
  });

  test('test default behavior', function(t) {
    sanitize({ id:'geoname:123' }, function( err, clean ){
      t.equal(clean.details, true, 'details set to true');
      t.end();
    });
  });
};

module.exports.tests.de_dupe = function(test, common) {
  var expected = { ids: [ { id: '1', type: 'geoname' }, { id: '2', type: 'osmnode' } ], details: true };
  test('duplicate ids', function(t) {
    sanitize( { id: ['geoname:1', 'osmnode:2', 'geoname:1'] }, function( err, clean ){
      t.equal(err, undefined, 'no error' );
      t.deepEqual(clean, expected, 'clean set correctly');
      t.end();
    });
  });
};

module.exports.tests.invalid_params = function(test, common) {
  test('invalid params', function(t) {
    sanitize( undefined, function( err, clean ){
      t.equal(err, defaultError, 'handle invalid params gracefully');
      t.end();
    });
  });
};

module.exports.tests.middleware_failure = function(test, common) {
  test('middleware failure', function(t) {
    var res = { status: function( code ){
      t.equal(code, 400, 'status set');
    }};
    var next = function( message ){
      t.equal(message, defaultError);
      t.end();
    };
    middleware( {}, res, next );
  });
};

module.exports.tests.middleware_success = function(test, common) {
  test('middleware success', function(t) {
    var req = { query: { id: 'geoname' + delimiter + '123' }};
    var next = function( message ){
      t.equal(message, undefined, 'no error message set');
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
