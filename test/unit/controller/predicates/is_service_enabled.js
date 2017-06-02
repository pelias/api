'use strict';

const _ = require('lodash');
const is_service_enabled = require('../../../../controller/predicates/is_service_enabled');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    t.equal(typeof is_service_enabled, 'function', 'is_service_enabled  is a function');
    t.equal(typeof is_service_enabled(), 'function', 'is_service_enabled() is a function');
    t.end();
  });
};

module.exports.tests.true_conditions = (test, common) => {
  test('string uri should return true', (t) => {
    t.ok(is_service_enabled('pip uri')());
    t.end();

  });

};

module.exports.tests.false_conditions = (test, common) => {
  test('undefined uri should return false', (t) => {
    t.notOk(is_service_enabled()());
    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`GET /is_service_enabled ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
