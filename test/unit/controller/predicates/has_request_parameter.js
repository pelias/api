'use strict';

const _ = require('lodash');
const has_request_parameter = require('../../../../controller/predicates/has_request_parameter');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', t => {
    t.equal(typeof has_request_parameter, 'function', 'has_request_parameter is a function');
    t.end();
  });
};

module.exports.tests.true_conditions = (test, common) => {
  test('request with specified parameter should return true', t => {
    [[], {}, 'string value', 17].forEach(val => {
      const req = {
        clean: {
          'parameter name': val
        }
      };

      t.ok(has_request_parameter('parameter name')(req));

    });

    t.end();

  });

};

module.exports.tests.false_conditions = (test, common) => {
  test('request with undefined clean should return false', t => {
    const req = {};

    t.notOk(has_request_parameter('parameter name')(req));
    t.end();

  });

  test('request.clean without specified parameter should return false', t => {
    const req = {
      clean: {}
    };

    t.notOk(has_request_parameter('parameter name')(req));
    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`GET /has_request_parameter ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
