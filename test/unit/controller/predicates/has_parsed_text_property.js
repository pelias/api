'use strict';

const _ = require('lodash');
const has_parsed_text_property = require('../../../../controller/predicates/has_parsed_text_property');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    t.equal(typeof has_parsed_text_property, 'function', 'has_parsed_text_property is a function');
    t.end();
  });
};

module.exports.tests.true_conditions = (test, common) => {
  test('defined request.clean.parsed_text.property should return true', (t) => {
    const req = {
      clean: {
        parsed_text: {
          property: 'value'
        }
      }
    };
    const res = {};

    t.ok(has_parsed_text_property('property')(req, res));
    t.end();

  });

};

module.exports.tests.false_conditions = (test, common) => {
  test('undefined request should return false', (t) => {
    const req = {};

    t.notOk(has_parsed_text_property('property')(req, undefined));
    t.end();

  });

  test('undefined request.clean should return false', (t) => {
    const req = {};

    t.notOk(has_parsed_text_property('property')(req, undefined));
    t.end();

  });

  test('undefined request.clean.parsed_text should return false', (t) => {
    const req = {
      clean: {}
    };

    t.notOk(has_parsed_text_property('property')(req, undefined));
    t.end();

  });

  test('undefined request.clean.parsed_text.property should return false', (t) => {
    const req = {
      clean: {
        parsed_text: {}
      }
    };

    t.notOk(has_parsed_text_property('property')(req, undefined));
    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`GET /has_parsed_text_property ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
