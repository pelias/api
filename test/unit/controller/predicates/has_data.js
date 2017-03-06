'use strict';

const _ = require('lodash');
const has_data = require('../../../../controller/predicates/has_data');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    t.equal(typeof has_data, 'function', 'has_data is a function');
    t.end();
  });
};

module.exports.tests.true_conditions = (test, common) => {
  test('response with non-empty data should return true', (t) => {
    const req = {};
    const res = {
      data: [1]
    };

    t.ok(has_data(req, res));
    t.end();

  });

};

module.exports.tests.false_conditions = (test, common) => {
  test('response with undefined data should return true', (t) => {
    const req = {};
    const res = {};

    t.notOk(has_data(req, res));
    t.end();

  });

  test('response with empty data array should return true', (t) => {
    const req = {};
    const res = {
      data: []
    };

    t.notOk(has_data(req, res));
    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`GET /has_data ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
