'use strict';

const proxyquire = require('proxyquire').noCallThru();

module.exports.tests = {};

module.exports.tests.invalid_configuration = (test, common) => {
  test('configuration validation throwing error should rethrow', (t) => {
    t.throws(() => {
      proxyquire('../../app', {
        './schema': 'this is the schema',
        'pelias-config': {
          generate: (schema) => {
            // the schema passed to generate should be the require'd schema
            t.equals(schema, 'this is the schema');

            throw Error('config is not valid');
          }
        }
      });

    }, /config is not valid/);

    t.end();

  });

};

module.exports.tests.api_indexName_deprecation_warning = (test, common) => {
  test('indexName found in api section of config should log deprecation warning', (t) => {
    const logger = require('pelias-mock-logger')();

    const app = proxyquire('../../app', {
      './schema': 'this is the schema',
      'pelias-config': {
        generate: (schema) => {
          return {
            api: {
              indexName: 'this is the indexName'
            }
          };
        }
      },
      'pelias-logger': logger,
      // mock out routes/v1 since it causes test to hang
      './routes/v1': {
        addRoutes: () => {}
      }
    });

    t.ok(logger.isWarnMessage(/^deprecation warning: api.indexName has been relocated to schema.indexName$/));
    t.end();

  });

};

module.exports.all = (tape, common) => {

  function test(name, testFunction) {
    return tape('app: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
