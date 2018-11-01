var sanitizeAll = require('../../../sanitizer/sanitizeAll');
const PeliasParameterError = require('../../../sanitizer/PeliasParameterError');

module.exports.tests = {};

function makeErrors(errors) {
  return errors.map(function(error) {
    return new PeliasParameterError(error);
  });
}

module.exports.tests.all = function(test, common) {
  test('req.clean/errors/warnings should be initialized when they are not', function(t) {
    var req = {};
    var sanitizers = {
      'first': {
        sanitize: function(){
          req.clean.a = 'first sanitizer';
          return {
            errors: ['error 1', 'error 2'],
            warnings: ['warning 1', 'warning 2']
          };
        }
      },
      'second': {
        sanitize: function() {
          req.clean.b = 'second sanitizer';
          return {
            errors: ['error 3'],
            warnings: ['warning 3']
          };
        }
      }
    };

    var expected_req = {
      clean: {
        a: 'first sanitizer',
        b: 'second sanitizer'
      },
      errors: makeErrors(['error 1', 'error 2', 'error 3']),
      warnings: ['warning 1', 'warning 2', 'warning 3']
    };


    sanitizeAll.runAllChecks(req, sanitizers);
    t.deepEquals(req, expected_req, 'error messages are as expected');
    t.ok(req.errors[0] instanceof PeliasParameterError, 'error has correct class');
    t.ok(req.errors[1] instanceof PeliasParameterError, 'error has correct class');
    t.ok(req.errors[2] instanceof PeliasParameterError, 'error has correct class');
    t.end();

  });

  test('req.clean/errors/warnings should not be initialized when they already have been', function(t) {
    var req = {
      clean: {
        alreadyInitialized: true
      },
      errors: ['pre-existing error'],
      warnings: ['pre-existing warning']
    };

    var sanitizers = {
      'first': {
        sanitize: function(){
          req.clean.a = 'first sanitizer';
          return {
            errors: ['error 1', 'error 2'],
            warnings: ['warning 1', 'warning 2']
          };
        }
      },
      'second': {
        sanitize: function() {
          req.clean.b = 'second sanitizer';
          return {
            errors: ['error 3'],
            warnings: ['warning 3']
          };
        }
      }
    };

    var expected_req = {
      clean: {
        alreadyInitialized: true,
        a: 'first sanitizer',
        b: 'second sanitizer'
      },
      errors: makeErrors(['pre-existing error', 'error 1', 'error 2', 'error 3']),
      warnings: ['pre-existing warning', 'warning 1', 'warning 2', 'warning 3']
    };

    sanitizeAll.runAllChecks(req, sanitizers);
    t.deepEquals(req, expected_req);
    t.end();
  });

  test('Error objects should be converted to correct type', function(t) {
    var req = {};
    var sanitizers = {
      'first': {
        sanitize: function(){
          req.clean.a = 'first sanitizer';
          return {
            errors: [new Error('error 1'), 'error 2'],
            warnings: []
          };
        }
      }
    };

    var expected_req = {
      clean: {
        a: 'first sanitizer'
      },
      errors: makeErrors(['error 1', 'error 2']),
      warnings: []
    };

    sanitizeAll.runAllChecks(req, sanitizers);
    t.deepEquals(req, expected_req);
    t.end();

  });


  test('req.query should be passed to individual sanitizers when available', function(t) {
    var req = {
      query: {
        value: 'query'
      }
    };
    var sanitizers = {
      'first': {
        sanitize: function (params) {
          req.clean.query = params;
          return {
            errors: [],
            warnings: []
          };
        }
      }
    };

    var expected_req = {
      query: {
        value: 'query'
      },
      clean: {
        query: {
          value: 'query'
        }
      },
      errors: [],
      warnings: []
    };

    sanitizeAll.runAllChecks(req, sanitizers);
    t.deepEquals(req, expected_req);
    t.end();
  });

  test('an empty object should be passed to individual sanitizers when req.query is unavailable', function(t) {
    var req = {};
    var sanitizers = {
      'first': {
        sanitize: function(params) {
          if (Object.keys(params).length === 0) {
            req.clean.empty_object_was_passed = true;
          }

          return {
            errors: [],
            warnings: []
          };
        }
      }
    };

    var expected_req = {
      clean: {
        empty_object_was_passed: true
      },
      errors: [],
      warnings: []
    };

    sanitizeAll.runAllChecks(req, sanitizers);
    t.deepEquals(req, expected_req);
    t.end();
  });

  test('unexpected parameters should add warning', function(t) {
    var req = {
          query: {
            unknown_value: 'query value'
          },
          errors: [],
          warnings: []
    };
    var sanitizers = {
      'first': {
        expected: function _expected () {
          // add value as a valid parameter
          return [{
            name: 'value'
          }];
        }
      }
    };

    sanitizeAll.checkParameters(req, sanitizers);
    t.equals(req.errors.length, 0);
    t.deepEquals(req.warnings[0], 'Invalid Parameter: unknown_value');
    t.end();
  });

  test('expected parameters should not add warning', function(t) {
    var req = {
          query: {
            value: 'query value'
          },
          errors: [],
          warnings: []
    };
    var sanitizers = {
      'first': {
        expected: function _expected () {
          // add value as a valid parameter
          return [{
            name: 'value'
          }];
        }
      }
    };

    sanitizeAll.checkParameters(req, sanitizers);
    t.equals(req.errors.length, 0);
    t.equals(req.warnings.length, 0);
    t.end();

  });

  test('sanitizer without expected() should not validate parameters', function(t) {
    var req = {
      query: {
        value: 'query'
      }
    };

    var sanitizers = {
      'first': {
        sanitize: function(params) {
          req.clean.query = params;
          return {
            errors: [],
            warnings: ['warning 1']
          };
        }
      }
    };

    var expected_req = {
      query: {
        value: 'query'
      },
      clean: {
        query: {
          value: 'query'
        }
      },
      errors: [],
      warnings: ['warning 1']
    };

    sanitizeAll.runAllChecks(req, sanitizers);
    t.deepEquals(req, expected_req);
    t.end();
  });

};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('SANITIZE sanitizeAll ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
