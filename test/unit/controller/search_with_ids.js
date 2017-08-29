'use strict';

const setup = require('../../../controller/search_with_ids');
const proxyquire =  require('proxyquire').noCallThru();
const mocklogger = require('pelias-mock-logger');
const _ = require('lodash');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    t.ok(_.isFunction(setup), 'setup is a function');
    t.ok(_.isFunction(setup()), 'setup returns a controller');
    t.end();
  });
};

module.exports.tests.success = (test, common) => {
  test('successful request to search service should replace data and meta', (t) => {
    t.plan(5);

    const logger = mocklogger();

    const config = {
      indexName: 'indexName value'
    };
    const esclient = 'this is the esclient';
    const query = () => ({
      body: 'this is the query body',
      type: 'this is the query type'
    });

    // a controller that validates the esclient and cmd that was passed to the search service
    const controller = proxyquire('../../../controller/search_with_ids', {
      '../service/search': (esclient, cmd, callback) => {
        t.equal(esclient, 'this is the esclient');
        t.deepEqual(cmd, {
          index: 'indexName value',
          searchType: 'dfs_query_then_fetch',
          body: 'this is the query body'
        });

        const docs = [
          { name: 'replacement result #1'},
          { name: 'replacement result #2'}
        ];
        const meta = { key: 'replacement meta value' };

        callback(undefined, docs, meta);
      },
      'pelias-logger': logger
    })(config, esclient, query, () => true );

    const req = { clean: { }, errors: [], warnings: [] };
    const res = {
      data: [
        { name: 'original result #1'},
        { name: 'original result #2'}
      ],
      meta: {
        key: 'original meta value'
      }
    };

    const next = () => {
      t.deepEqual(req, {
        clean: {},
        errors: [],
        warnings: []
      });
      t.deepEquals(res, {
        data: [
          { name: 'replacement result #1'},
          { name: 'replacement result #2'}
        ],
        meta: {
          key: 'replacement meta value',
          query_type: 'this is the query type'
        }
      });

      t.ok(logger.isInfoMessage('[controller:search] [queryType:this is the query type] [es_result_count:2]'));

      t.end();
    };

    controller(req, res, next);

  });

  test('undefined meta should set empty object into res', (t) => {
    const logger = mocklogger();

    const config = {
      indexName: 'indexName value'
    };
    const esclient = 'this is the esclient';
    const query = () => ({
      body: 'this is the query body',
      type: 'this is the query type'
    });

    // a controller that validates the esclient and cmd that was passed to the search service
    const controller = proxyquire('../../../controller/search_with_ids', {
      '../service/search': (esclient, cmd, callback) => {
        const docs = [
          { name: 'replacement result #1'},
          { name: 'replacement result #2'}
        ];

        callback(undefined, docs, undefined);
      },
      'pelias-logger': logger
    })(config, esclient, query, () => true );

    const req = { clean: { }, errors: [], warnings: [] };
    const res = {
      data: [
        { name: 'original result #1'},
        { name: 'original result #2'}
      ],
      meta: {
        key: 'original meta value'
      }
    };

    const next = () => {
      t.deepEqual(req, {
        clean: {},
        errors: [],
        warnings: []
      });
      t.deepEquals(res, {
        data: [
          { name: 'replacement result #1'},
          { name: 'replacement result #2'}
        ],
        meta: {
          query_type: 'this is the query type'
        }
      });

      t.end();
    };

    controller(req, res, next);

  });

  test('undefined docs in response should not overwrite existing results', (t) => {
    t.plan(1+3); // ensures that search service was called, then req+res+logger tests

    const logger = mocklogger();

    const config = {
      indexName: 'indexName value'
    };
    const esclient = 'this is the esclient';
    const query = () => ({
      body: 'this is the query body',
      type: 'this is the query type'
    });

    // a controller that validates the esclient and cmd that was passed to the search service
    const controller = proxyquire('../../../controller/search_with_ids', {
      '../service/search': (esclient, cmd, callback) => {
        t.pass('search service was called');

        const meta = { key: 'new value' };

        callback(undefined, undefined, meta);
      },
      'pelias-logger': logger
    })(config, esclient, query, () => true );

    const req = { clean: { }, errors: [], warnings: [] };
    const res = {
      data: [
        { id: 1 },
        { id: 2 }
      ],
      meta: {
        key: 'value'
      }
    };

    const next = () => {
      t.deepEqual(req, {
        clean: {},
        errors: [],
        warnings: []
      });
      t.deepEquals(res, {
        data: [
          { id: 1 },
          { id: 2 }
        ],
        meta: { key: 'value' }
      });

      t.notOk(logger.isInfoMessage(/[controller:search] [queryType:this is the query type] [es_result_count:0]/));

      t.end();
    };

    controller(req, res, next);

  });

  test('empty docs in response should not overwrite existing results', (t) => {
    t.plan(4);

    const logger = mocklogger();

    const config = {
      indexName: 'indexName value'
    };
    const esclient = 'this is the esclient';
    const query = () => ({
      body: 'this is the query body',
      type: 'this is the query type'
    });

    // a controller that validates the esclient and cmd that was passed to the search service
    const controller = proxyquire('../../../controller/search_with_ids', {
      '../service/search': (esclient, cmd, callback) => {
        t.pass('search service was called');

        const meta = { key: 'value' };

        callback(undefined, [], meta);
      }
    })(config, esclient, query, () => true );

    const req = { clean: { }, errors: [], warnings: [] };
    const res = {
      data: [
        { name: 'pre-existing result #1' },
        { name: 'pre-existing result #2' }
      ],
      meta: {
        key: 'value'
      }
    };

    const next = () => {
      t.deepEqual(req, {
        clean: {},
        errors: [],
        warnings: []
      });
      t.deepEquals(res, {
        data: [
          { name: 'pre-existing result #1' },
          { name: 'pre-existing result #2' }
        ],
        meta: { key: 'value' }
      });

      t.notOk(logger.isInfoMessage(/[controller:search] [queryType:this is the query type] [es_result_count:0]/));

      t.end();
    };

    controller(req, res, next);

  });

  test('successful request on retry to search service should log info message', (t) => {
    t.plan(3+2+2); // 3 search service calls, 2 log messages, 1 req, 1 res

    const logger = mocklogger();

    const config = {
      indexName: 'indexName value'
    };
    const esclient = 'this is the esclient';
    const query = () => ({
      body: 'this is the query body',
      type: 'this is the query type'
    });

    let searchServiceCallCount = 0;

    const timeoutError = {
      status: 408,
      displayName: 'RequestTimeout',
      message: 'Request Timeout after 17ms'
    };

    // a controller that validates the esclient and cmd that was passed to the search service
    const controller = proxyquire('../../../controller/search_with_ids', {
      '../service/search': (esclient, cmd, callback) => {
        t.pass('search service was called');

        if (searchServiceCallCount < 2) {
          // note that the searchService got called
          searchServiceCallCount++;
          callback(timeoutError);
        } else {
          const docs = [
            { name: 'replacement result #1'},
            { name: 'replacement result #2'}
          ];
          const meta = { key: 'replacement meta value' };

          callback(undefined, docs, meta);
        }

      },
      'pelias-logger': logger
    })(config, esclient, query, () => true );

    const req = { clean: { }, errors: [], warnings: [] };
    const res = {
      data: [
        { name: 'original result #1'},
        { name: 'original result #2'}
      ],
      meta: {
        key: 'original meta value'
      }
    };

    const next = () => {
      t.deepEqual(req, {
        clean: {},
        errors: [],
        warnings: []
      });
      t.deepEquals(res, {
        data: [
          { name: 'replacement result #1'},
          { name: 'replacement result #2'}
        ],
        meta: {
          key: 'replacement meta value',
          query_type: 'this is the query type'
        }
      });

      t.ok(logger.isInfoMessage('[controller:search] [queryType:this is the query type] [es_result_count:2]'));
      t.ok(logger.isInfoMessage('succeeded on retry 2'));

      t.end();
    };

    controller(req, res, next);

  });

};

module.exports.tests.service_errors = (test, common) => {
  test('default # of request timeout retries should be 3', (t) => {
    // test for 1 initial search service, 3 retries, 1 log messages, 1 req, and 1 res
    t.plan(1 + 3 + 1 + 2);

    const logger = mocklogger();

    const config = {
      indexName: 'indexName value'
    };
    const esclient = 'this is the esclient';
    const query = () => ({
      body: 'this is the query body',
    });

    const timeoutError = {
      status: 408,
      displayName: 'RequestTimeout',
      message: 'Request Timeout after 17ms'
    };

    // a controller that validates that the search service was called
    const controller = proxyquire('../../../controller/search_with_ids', {
      '../service/search': (esclient, cmd, callback) => {
        // note that the searchService got called
        t.pass('search service was called');

        callback(timeoutError);
      },
      'pelias-logger': logger
    })(config, esclient, query, () => true );

    const req = { clean: { }, errors: [], warnings: [] };
    const res = {};

    const next = () => {
      t.deepEqual(logger.getInfoMessages(), [
        '[req]',
        'request timed out on attempt 1, retrying',
        'request timed out on attempt 2, retrying',
        'request timed out on attempt 3, retrying'
      ]);

      t.deepEqual(req, {
        clean: {},
        errors: [timeoutError.message],
        warnings: []
      });
      t.deepEqual(res, {});
      t.end();
    };

    controller(req, res, next);

  });

  test('explicit apiConfig.requestRetries should retry that many times', (t) => {
    t.plan(1 + 17); // test for initial search service call and 17 retries

    const config = {
      indexName: 'indexName value',
      requestRetries: 17
    };
    const esclient = 'this is the esclient';
    const query = () => ({ });

    const timeoutError = {
      status: 408,
      displayName: 'RequestTimeout',
      message: 'Request Timeout after 17ms'
    };

    // a controller that validates that the search service was called
    const controller = proxyquire('../../../controller/search_with_ids', {
      '../service/search': (esclient, cmd, callback) => {
        // note that the searchService got called
        t.pass('search service was called');

        callback(timeoutError);
      }
    })(config, esclient, query, () => true );

    const req = { clean: { }, errors: [], warnings: [] };
    const res = {};

    controller(req, res, () => t.end() );

  });

  test('only status code 408 should be considered a retryable request', (t) => {
    t.plan(2);

    const config = {
      indexName: 'indexName value',
      requestRetries: 17
    };
    const esclient = 'this is the esclient';
    const query = () => ({ });

    const nonTimeoutError = {
      status: 500,
      displayName: 'InternalServerError',
      message: 'an internal server error occurred'
    };

    // a controller that validates that the search service was called
    const controller = proxyquire('../../../controller/search_with_ids', {
      '../service/search': (esclient, cmd, callback) => {
        // note that the searchService got called
        t.pass('search service was called');

        callback(nonTimeoutError);
      }
    })(config, esclient, query, () => true );

    const req = { clean: { }, errors: [], warnings: [] };
    const res = {};

    const next = () => {
      t.deepEqual(req, {
        clean: {},
        errors: [nonTimeoutError.message],
        warnings: []
      });
      t.end();
    };

    controller(req, res, next);

  });

  test('string error should not retry and be logged as-is', (t) => {
    t.plan(2); // service call + error is in req.errors

    const config = {
      indexName: 'indexName value'
    };
    const esclient = 'this is the esclient';
    const query = () => ({ });

    // a controller that validates that the search service was called
    const controller = proxyquire('../../../controller/search_with_ids', {
      '../service/search': (esclient, cmd, callback) => {
        // note that the searchService got called
        t.pass('search service was called');

        callback('this is an error string');
      }
    })(config, esclient, query, () => true );

    const req = { clean: { }, errors: [], warnings: [] };
    const res = {};

    const next = () => {
      t.deepEqual(req, {
        clean: {},
        errors: ['this is an error string'],
        warnings: []
      });
      t.end();
    };

    controller(req, res, next);

  });

};

module.exports.tests.should_execute = (test, common) => {
  test('should_execute returning false and empty req.errors should call next', (t) => {
    const esclient = () => t.fail('esclient should not have been called');
    const query = () => t.fail('query should not have been called');
    const should_execute = () => false;
    const controller = setup( {}, esclient, query, should_execute );

    const req = { };
    const res = { };

    const next = () => {
      t.deepEqual(res, { });
      t.end();
    };
    controller(req, res, next);

  });

};

module.exports.tests.undefined_query = (test, common) => {
  test('query returning undefined should not call service', (t) => {
    t.plan(0, 'test will fail if search service actually gets called');

    // a function that returns undefined
    const query = () => undefined;

    const controller = proxyquire('../../../controller/search_with_ids', {
      '../service/search': () => {
        t.fail('search service should not have been called');
      }
    })(undefined, undefined, query, () => true );

    const next = () => t.end();

    controller({}, {}, next);

  });
};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`GET /search ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
