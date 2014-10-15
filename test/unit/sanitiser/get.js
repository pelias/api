
var get  = require('../../../sanitiser/get'),
    _sanitize = get.sanitize,
    middleware = get.middleware,
    indeces = require('../../../query/indeces'),
    defaultIdError = 'invalid param \'id\': text length, must be >0',
    defaultTypeError = 'invalid param \'type\': text length, must be >0',
    defaultError = defaultIdError,
    defaultMissingTypeError = 'type must be one of these values - [' + indeces.join(", ") + ']',
    defaultClean = { id: '123', type: 'geoname' },
    sanitize = function(query, cb) { _sanitize({'query':query}, cb); }

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

module.exports.tests.sanitize_id_and_type = function(test, common) {
  var inputs = {
    valid: [
      {id:'1', type:'geoname'},
      {id:'2', type:'osmnode'},
      {id:'3', type:'geoname'},
      {id:'4', type:'osmway'},
      {id:'5', type:'admin0'}
    ],
    invalid: [ 
      {id:undefined, type:undefined},
      {id:null, type:null},
      {id:'', type:''},
      {id:'4', type:''},
      {id:'5', type:'gibberish'}
    ]
  };

  test('invalid id and/or type', function(t) {
    inputs.invalid.forEach( function( input ){
      sanitize({ id: input.id, type: input.type }, function( err, clean ){
        switch (err) {
          case defaultIdError:
            t.equal(err, defaultIdError, input.id + ' is invalid (missing id)'); break;
          case defaultTypeError:
            t.equal(err, defaultTypeError, input.type + ' is invalid (missing type)'); break;
          case defaultMissingTypeError:
            t.equal(err, defaultMissingTypeError, input.type + ' is an unknown type'); break;
          default: break;
        }
        t.equal(clean, undefined, 'clean not set');
      });
    });
    t.end();
  });

  test('valid id and/or type', function(t) {
    inputs.valid.forEach( function( input ){
      var expected = { id: input.id, type: input.type };
      sanitize({ id: input.id, type: input.type, }, function( err, clean ){
        t.equal(err, undefined, 'no error (' + input.id + ', ' + input.type + ')' );
        t.deepEqual(clean, expected, 'clean set correctly (' + input.id + ', ' + input.type + ')');
      });
    });
    t.end();
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
    var req = { query: { id: '123', type: 'geoname' }};
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
    return tape('SANTIZE /get ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};