const proxyquire =  require('proxyquire').noCallThru();
const mock_logger = require('pelias-mock-logger');

module.exports.tests = {};

module.exports.tests.sanitize = (test, common) => {
  test('verify that no sanitizers were called when should_execute returns false', (t) => {
    t.plan(1);

    const logger = mock_logger();

    // rather than re-verify the functionality of all the sanitizers, this test just verifies that they
    //  were all called correctly
    const defer_to_pelias_parser = proxyquire('../../../sanitizer/defer_to_pelias_parser', {
      '../sanitizer/_text_pelias_parser': function () {
        return {
          sanitize: () => {
            t.fail('_text_pelias_parser should not have been called');
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

    defer_to_pelias_parser({}, {}, () => {
      t.equals(logger.getInfoMessages().length, 0);
      t.end();
    });

  });

  test('verify that _text_pelias_parser sanitizer was called when should_execute returns true', (t) => {
    t.plan(2);

    const logger = mock_logger();

    // rather than re-verify the functionality of all the sanitizers, this test just verifies that they
    //  were all called correctly
    const defer_to_pelias_parser = proxyquire('../../../sanitizer/defer_to_pelias_parser', {
      '../sanitizer/_text_pelias_parser': function () {
        return {
          sanitize: () => {
            t.pass('_text_pelias_parser should have been called');
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

    defer_to_pelias_parser(req, {}, () => {
      t.end();
    });

  });

  test('query should not be logged if path != \'/v1/search\'', (t) => {
    t.plan(3);

    const logger = mock_logger();

    // rather than re-verify the functionality of all the sanitizers, this test just verifies that they
    //  were all called correctly
    const defer_to_pelias_parser = proxyquire('../../../sanitizer/defer_to_pelias_parser', {
      '../sanitizer/_text_pelias_parser': function () {
        return {
          sanitize: () => {
            t.pass('_text_pelias_parser should have been called');
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

    defer_to_pelias_parser(req, {}, () => {
      t.deepEquals(logger.getInfoMessages(), []);
      t.end();
    });

  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape(`SANITIZE /defer_to_pelias_parser ${name}`, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
