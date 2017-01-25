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

module.exports.all = (tape, common) => {

  function test(name, testFunction) {
    return tape('app: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
