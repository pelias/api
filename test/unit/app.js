'use strict';

const proxyquire = require('proxyquire').noCallThru();

module.exports.tests = {};

module.exports.tests.invalid_configuration = function(test, common) {
  test('configuration validation throwing error should rethrow', function(t) {
    t.throws(function() {
      proxyquire('../../app', {
        './src/configValidation': {
          validate: () => {
            throw Error('config is not valid');
          }
        }
      });

    }, /config is not valid/);

    t.end();

  });

};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('app: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
