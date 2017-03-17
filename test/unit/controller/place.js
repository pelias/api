'use strict';

const setup = require('../../../controller/place');
const proxyquire =  require('proxyquire').noCallThru();

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    t.equal(typeof setup, 'function', 'setup is a function');
    t.equal(typeof setup(), 'function', 'setup returns a controller');
    t.end();
  });
};

module.exports.tests.success = (test, common) => {
  test('successful request to search service should set data and meta', (t) => {
    const config = {
      indexName: 'indexName value'
    };
    const esclient = 'this is the esclient';

    // request timeout messages willl be written here
    const infoMesssages = [];

    // a controller that validates the esclient and cmd that was passed to the search service
    const controller = proxyquire('../../../controller/place', {
      '../service/mget': (esclient, query, callback) => {
        t.equal(esclient, 'this is the esclient');
        t.deepEqual(query, [
          {
            _index: 'indexName value',
            _type: 'layer1',
            _id: 'id1'
          },
          {
            _index: 'indexName value',
            _type: 'layer2',
            _id: 'id2'
          }
        ]);

        const docs = [{}, {}];

        callback(undefined, docs);
      }
    })(config, esclient);

    const req = {
      clean: {
        ids: [
          {
            id: 'id1',
            layers: 'layer1'
          },
          {
            id: 'id2',
            layers: 'layer2'
          }
        ]
      },
      errors: [],
      warnings: []
    };
    const res = {};

    const next = () => {
      t.deepEqual(req.errors, []);
      t.deepEqual(req.warnings, []);
      t.deepEquals(res.data, [{}, {}]);
      t.end();
    };

    controller(req, res, next);

  });

};

module.exports.tests.error_conditions = (test, common) => {
  test('non-empty req.errors should ', (t) => {
    const esclient = () => {
      throw new Error('esclient should not have been called');
    };
    const controller = setup( {}, esclient );

    // the existence of `errors` means that a sanitizer detected an error,
    //  so don't call the esclient
    const req = {
      errors: ['error']
    };
    const res = { };

    t.doesNotThrow(() => {
      controller(req, res, () => {});
    });
    t.end();

  });

  test('mgetService returning error should add to req.errors and ignore docs', (t) => {
    const config = {
      indexName: 'indexName value'
    };
    const esclient = 'this is the esclient';

    // request timeout messages willl be written here
    const infoMesssages = [];

    const nonTimeoutError = {
      status: 500,
      displayName: 'InternalServerError',
      message: 'an internal server error occurred'
    };

    // a controller that validates the esclient and cmd that was passed to the search service
    const controller = proxyquire('../../../controller/place', {
      '../service/mget': (esclient, query, callback) => {
        const docs = [{}, {}];

        callback(nonTimeoutError, docs);
      }
    })(config, esclient);

    const req = {
      clean: {
        ids: [
          {
            id: 'id1',
            layers: 'layer1'
          }
        ]
      },
      errors: [],
      warnings: []
    };
    const res = {};

    const next = () => {
      t.deepEqual(req.errors, [nonTimeoutError.message]);
      t.deepEqual(req.warnings, []);
      t.deepEquals(res.data, undefined);
      t.end();
    };

    controller(req, res, next);

  });

};

module.exports.tests.timeout = function(test, common) {
  test('default # of request timeout retries should be 3', (t) => {
    const config = {
      indexName: 'indexName value'
    };
    const esclient = 'this is the esclient';

    let searchServiceCallCount = 0;

    const timeoutError = {
      status: 408,
      displayName: 'RequestTimeout',
      message: 'Request Timeout after 17ms'
    };

    // request timeout messages willl be written here
    const infoMesssages = [];

    // a controller that validates the esclient and cmd that was passed to the search service
    const controller = proxyquire('../../../controller/place', {
      '../service/mget': (esclient, cmd, callback) => {
        // not that the searchService got called
        searchServiceCallCount++;

        callback(timeoutError);
      },
      'pelias-logger': {
        get: (service) => {
          t.equal(service, 'api');
          return {
            info: (msg) => {
              infoMesssages.push(msg);
            },
            debug: () => {}
          };
        }
      }
    })(config, esclient);

    const req = {
      clean: {
        ids: [
          {
            id: 'id1',
            layers: 'layer1'
          }
        ]
      },
      errors: [],
      warnings: []
    };
    const res = {};

    const next = () => {
      t.equal(searchServiceCallCount, 3+1);

      t.ok(infoMesssages.indexOf('request timed out on attempt 1, retrying') !== -1);
      t.ok(infoMesssages.indexOf('request timed out on attempt 2, retrying') !== -1);
      t.ok(infoMesssages.indexOf('request timed out on attempt 3, retrying') !== -1);

      t.deepEqual(req.errors, [timeoutError.message]);
      t.deepEqual(res, {});
      t.end();
    };

    controller(req, res, next);

  });

  test('explicit apiConfig.requestRetries should retry that many times', (t) => {
    const config = {
      indexName: 'indexName value',
      requestRetries: 17
    };
    const esclient = 'this is the esclient';

    let searchServiceCallCount = 0;

    const timeoutError = {
      status: 408,
      displayName: 'RequestTimeout',
      message: 'Request Timeout after 17ms'
    };

    // a controller that validates the esclient and cmd that was passed to the search service
    const controller = proxyquire('../../../controller/place', {
      '../service/mget': (esclient, cmd, callback) => {
        // not that the searchService got called
        searchServiceCallCount++;

        callback(timeoutError);
      }
    })(config, esclient);

    const req = {
      clean: {
        ids: [
          {
            id: 'id1',
            layers: 'layer1'
          }
        ]
      },
      errors: [],
      warnings: []
    };
    const res = {};

    const next = () => {
      t.equal(searchServiceCallCount, 17+1);
      t.end();
    };

    controller(req, res, next);

  });

  test('only status code 408 should be considered a retryable request', (t) => {
    const config = {
      indexName: 'indexName value'
    };
    const esclient = 'this is the esclient';

    let searchServiceCallCount = 0;

    const nonTimeoutError = {
      status: 500,
      displayName: 'InternalServerError',
      message: 'an internal server error occurred'
    };

    // a controller that validates the esclient and cmd that was passed to the search service
    const controller = proxyquire('../../../controller/place', {
      '../service/mget': (esclient, cmd, callback) => {
        // not that the searchService got called
        searchServiceCallCount++;

        callback(nonTimeoutError);
      }
    })(config, esclient);

    const req = {
      clean: {
        ids: [
          {
            id: 'id1',
            layers: 'layer1'
          }
        ]
      },
      errors: [],
      warnings: []
    };
    const res = {};

    const next = () => {
      t.equal(searchServiceCallCount, 1);
      t.deepEqual(req.errors, [nonTimeoutError.message]);
      t.end();
    };

    controller(req, res, next);

  });

  test('string error should not retry and be logged as-is', (t) => {
    const config = {
      indexName: 'indexName value'
    };
    const esclient = 'this is the esclient';

    let searchServiceCallCount = 0;

    const stringTypeError = 'this is an error string';

    // a controller that validates the esclient and cmd that was passed to the search service
    const controller = proxyquire('../../../controller/place', {
      '../service/mget': (esclient, cmd, callback) => {
        // not that the searchService got called
        searchServiceCallCount++;

        callback(stringTypeError);
      }
    })(config, esclient);

    const req = {
      clean: {
        ids: [
          {
            id: 'id1',
            layers: 'layer1'
          }
        ]
      },
      errors: [],
      warnings: []
    };
    const res = {};

    const next = () => {
      t.equal(searchServiceCallCount, 1);
      t.deepEqual(req.errors, [stringTypeError]);
      t.end();
    };

    controller(req, res, next);

  });

};

module.exports.all = (tape, common) => {

  function test(name, testFunction) {
    return tape('GET /place ' + name, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
