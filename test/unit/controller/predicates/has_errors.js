'use strict';

const _ = require('lodash');
const has_errors = require('../../../../controller/predicates/has_errors');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    t.equal(typeof has_errors, 'function', 'has_errors is a function');
    t.end();
  });
};

module.exports.tests.true_conditions = (test, common) => {
  test('request with non-empty errors should return true', (t) => {
    const req = {
      errors: ['error']
    };
    const res = {};

    t.ok(has_errors(req, res));
    t.end();

  });

};

module.exports.tests.false_conditions = (test, common) => {
  test('response with undefined errors should return false', (t) => {
    const req = {};
    const res = {};

    t.notOk(has_errors(req, res));
    t.end();

  });

  test('response with empty errors array should return false', (t) => {
    const req = {
      errors: []
    };
    const res = {};

    t.notOk(has_errors(req, res));
    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`GET /has_errors ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
