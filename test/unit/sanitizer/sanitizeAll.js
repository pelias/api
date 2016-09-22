var sanitizeAll = require('../../../sanitizer/sanitizeAll');

module.exports.tests = {};

module.exports.tests.all = function(test, common) {
  test('req.clean/errors/warnings should be initialized when they are not', function(t) {
    var req = {};
    var sanitizers = [
      function() {
        req.clean.a = 'first sanitizer';
        return {
          errors: ['error 1', 'error 2'],
          warnings: ['warning 1', 'warning 2']
        };
      },
      function() {
        req.clean.b = 'second sanitizer';
        return {
          errors: ['error 3'],
          warnings: ['warning 3']
        };
      }
    ];

    var expected_req = {
      clean: {
        a: 'first sanitizer',
        b: 'second sanitizer'
      },
      errors: ['error 1', 'error 2', 'error 3'],
      warnings: ['warning 1', 'warning 2', 'warning 3']
    };

    sanitizeAll(req, sanitizers, function(){
      t.deepEquals(req, expected_req);
      t.end();
    });

  });

  test('req.clean/errors/warnings should not be initialized when they already have been', function(t) {
    var req = {
      clean: {
        alreadyInitialized: true
      },
      errors: ['pre-existing error'],
      warnings: ['pre-existing warning']
    };

    var sanitizers = [
      function() {
        req.clean.a = 'first sanitizer';
        return {
          errors: ['error 1', 'error 2'],
          warnings: ['warning 1', 'warning 2']
        };
      },
      function() {
        req.clean.b = 'second sanitizer';
        return {
          errors: ['error 3'],
          warnings: ['warning 3']
        };
      }
    ];

    var expected_req = {
      clean: {
        alreadyInitialized: true,
        a: 'first sanitizer',
        b: 'second sanitizer'
      },
      errors: ['pre-existing error', 'error 1', 'error 2', 'error 3'],
      warnings: ['pre-existing warning', 'warning 1', 'warning 2', 'warning 3']
    };

    sanitizeAll(req, sanitizers, function(){
      t.deepEquals(req, expected_req);
      t.end();
    });

  });

  test('req.query should be passed to individual sanitizers when available', function(t) {
    var req = {
      query: {
        value: 'query value'
      }
    };
    var sanitizers = [
      function(params) {
        req.clean.query = params;
        return {
          errors: [],
          warnings: []
        };
      }
    ];

    var expected_req = {
      query: {
        value: 'query value'
      },
      clean: {
        query: {
          value: 'query value'
        }
      },
      errors: [],
      warnings: []
    };

    sanitizeAll(req, sanitizers, function(){
      t.deepEquals(req, expected_req);
      t.end();
    });

  });

  test('an empty object should be passed to individual sanitizers when req.query is unavailable', function(t) {
    var req = {};
    var sanitizers = [
      function(params) {
        if (Object.keys(params).length === 0) {
          req.clean.empty_object_was_passed = true;
        }

        return {
          errors: [],
          warnings: []
        };
      }
    ];

    var expected_req = {
      clean: {
        empty_object_was_passed: true
      },
      errors: [],
      warnings: []
    };

    sanitizeAll(req, sanitizers, function(){
      t.deepEquals(req, expected_req);
      t.end();
    });

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
