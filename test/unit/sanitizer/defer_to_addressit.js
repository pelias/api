const proxyquire =  require('proxyquire').noCallThru();
const mock_logger = require('pelias-mock-logger');

module.exports.tests = {};

module.exports.tests.sanitize = (test, common) => {
  test('verify that no sanitizers were called when should_execute returns false', (t) => {
    t.plan(1);

    const logger = mock_logger();

    // rather than re-verify the functionality of all the sanitizers, this test just verifies that they
    //  were all called correctly
    const defer_to_addressit = proxyquire('../../../sanitizer/defer_to_addressit', {
      '../sanitizer/_text_addressit': function () {
        return {
          sanitize: () => {
            t.fail('_text_addressit should not have been called');
          }
        };
      },
      'pelias-logger': logger,
      '../sanitizer/_debug': () => {
        return {
          sanitize: () => {
            t.fail('_debug should not have been called');
          }
        };
      }
    })(() => false);

    defer_to_addressit({}, {}, () => {
      t.equals(logger.getInfoMessages().length, 0);
      t.end();
    });

  });

  test('verify that _text_addressit sanitizer was called when should_execute returns true', (t) => {
    t.plan(3);

    const logger = mock_logger();

    // rather than re-verify the functionality of all the sanitizers, this test just verifies that they
    //  were all called correctly
    const defer_to_addressit = proxyquire('../../../sanitizer/defer_to_addressit', {
      '../sanitizer/_text_addressit': function () {
        return {
          sanitize: () => {
            t.pass('_text_addressit should have been called');
            return { errors: [], warnings: [] };
          }
        };
      },
      'pelias-logger': logger,
      '../helper/logging': {
        isDNT: () => false
      },
      '../sanitizer/_debug': () => {
        return {
          sanitize: () => {
            t.pass('_debug should have been called');
            return { errors: [], warnings: [] };
          }
        };
      },
    })(() => true);

    const req = {
      path: '/v1/search',
      clean: {
        text: 'this is the query text'
      }
    };

    defer_to_addressit(req, {}, () => {
      t.deepEquals(logger.getInfoMessages(), ['fallback queryText: this is the query text']);
      t.end();
    });

  });

  test('query should not be logged if path != \'/v1/search\'', (t) => {
    t.plan(3);

    const logger = mock_logger();

    // rather than re-verify the functionality of all the sanitizers, this test just verifies that they
    //  were all called correctly
    const defer_to_addressit = proxyquire('../../../sanitizer/defer_to_addressit', {
      '../sanitizer/_text_addressit': function () {
        return {
          sanitize: () => {
            t.pass('_text_addressit should have been called');
            return { errors: [], warnings: [] };
          }
        };
      },
      'pelias-logger': logger,
      '../sanitizer/_debug': () => {
        return {
          sanitize: () => {
            t.pass('_debug should have been called');
            return { errors: [], warnings: [] };
          }
        };
      },
    })(() => true);

    const req = {
      path: 'not /v1/search',
      clean: {
        text: 'this is the query text'
      }
    };

    defer_to_addressit(req, {}, () => {
      t.deepEquals(logger.getInfoMessages(), []);
      t.end();
    });

  });

  test('query should be logged as [text removed] if private', (t) => {
    t.plan(3);

    const logger = mock_logger();

    // rather than re-verify the functionality of all the sanitizers, this test just verifies that they
    //  were all called correctly
    const defer_to_addressit = proxyquire('../../../sanitizer/defer_to_addressit', {
      '../sanitizer/_text_addressit': function () {
        return {
          sanitize: () => {
            t.pass('_text_addressit should have been called');
            return { errors: [], warnings: [] };
          }
        };
      },
      'pelias-logger': logger,
      '../helper/logging': {
        isDNT: () => true
      },
      '../sanitizer/_debug': () => {
        return {
          sanitize: () => {
            t.pass('_debug should have been called');
          return { errors: [], warnings: [] };
          }
        };
      }
    })(() => true);

    const req = {
      path: '/v1/search',
      clean: {
        text: 'this is the query text'
      }
    };

    defer_to_addressit(req, {}, () => {
      t.deepEquals(logger.getInfoMessages(), ['fallback queryText: [text removed]']);
      t.end();
    });

  });

};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape(`SANITIZE /defer_to_addressit ${name}`, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
