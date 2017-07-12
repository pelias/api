'use strict';

const _ = require('lodash');
const is_addressit_parse = require('../../../../controller/predicates/is_addressit_parse');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', t => {
    t.ok(_.isFunction(is_addressit_parse), 'is_addressit_parse is a function');
    t.end();
  });
};

module.exports.tests.true_conditions = (test, common) => {
  test('request.clean.parser=addressit should return true', t => {
    const req = {
      clean: {
        parser: 'addressit'
      }
    };

    t.ok(is_addressit_parse(req));
    t.end();

  });

};

module.exports.tests.false_conditions = (test, common) => {
  test('undefined request should return false', t => {
    t.notOk(is_addressit_parse(undefined));
    t.end();
  });

  test('undefined request.clean should return false', t => {
    const req = {};

    t.notOk(is_addressit_parse(req));
    t.end();
  });

  test('undefined request.clean.parser should return false', t => {
    const req = {
      clean: {}
    };

    t.notOk(is_addressit_parse(req));
    t.end();
  });

  test('non-\'addressit\' request.clean.parser should return false', t => {
    const req = {
      clean: {
        parser: 'not addressit'
      }
    };

    t.notOk(is_addressit_parse(req));
    t.end();
  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`GET /is_addressit_parse ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
