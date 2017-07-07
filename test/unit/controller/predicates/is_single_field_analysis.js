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
  test('defined request.clean.parsed_text.property should return true', (t) => {
    const req = {
      clean: {
        parsed_text: {
          property: 'value'
        }
      }
    };

    t.ok(is_single_field_analysis('property')(req));
    t.end();

  });

};

module.exports.tests.false_conditions = (test, common) => {
  test('undefined request should return false', (t) => {
    t.notOk(is_single_field_analysis('property')());
    t.end();

  });

  test('undefined request.clean should return false', (t) => {
    const req = {};

    t.notOk(is_single_field_analysis('property')(req));
    t.end();

  });

  test('undefined request.clean.parsed_text should return false', (t) => {
    const req = {
      clean: {}
    };

    t.notOk(is_single_field_analysis('property')(req));
    t.end();

  });

  test('request.clean.parsed_text with none of the supplied properties should return false', (t) => {
    const req = {
      clean: {
        parsed_text: {}
      }
    };

    t.notOk(is_single_field_analysis('property')(req));
    t.end();

  });

  test('request.clean.parsed_text with none of the supplied properties should return false', (t) => {
    const req = {
      clean: {
        parsed_text: {
          property: 'value',
          another_property: 'value'
        }
      }
    };

    t.notOk(is_single_field_analysis('property')(req));
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
