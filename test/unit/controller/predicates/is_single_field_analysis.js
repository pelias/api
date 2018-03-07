'use strict';

const _ = require('lodash');
const is_single_field_analysis = require('../../../../controller/predicates/is_single_field_analysis');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    t.ok(_.isFunction(is_single_field_analysis), 'is_single_field_analysis is a function');
    t.end();
  });

};

module.exports.tests.true_conditions = (test, common) => {
  test('req.clean.parsed_text with a single field should return true', t => {
    const req = {
      clean: {
        parsed_text: {
          property: 'value'
        }
      }
    };

    t.ok(is_single_field_analysis(req));
    t.end();

  });

};

module.exports.tests.false_conditions = (test, common) => {
  test('undefined request should return false', t => {
    t.notOk(is_single_field_analysis());
    t.end();

  });

  test('undefined req.clean should return false', t => {
    t.notOk(is_single_field_analysis({}));
    t.end();

  });

  test('undefined req.clean.parsed_text should return false', t => {
    t.notOk(is_single_field_analysis({ clean: {} }));
    t.end();

  });

  test('req.clean.parsed_text with 0 properties should return false', t => {
    t.notOk(is_single_field_analysis({ clean: { parsed_text: {} } }));
    t.end();

  });

  test('req.clean.parsed_text with 2 properties should return false', t => {
    const req = {
      clean: {
        parsed_text: {
          property1: 'property1 value',
          property2: 'property2 value'
        }
      }
    };

    t.notOk(is_single_field_analysis(req));
    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`GET /is_single_field_analysis ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
