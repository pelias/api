'use strict';

const _ = require('lodash');
const has_any_parsed_text_property = require('../../../../controller/predicates/has_any_parsed_text_property');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    t.ok(_.isFunction(has_any_parsed_text_property), 'has_any_parsed_text_property is a function');
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

    t.ok(has_any_parsed_text_property('property')(req));
    t.end();

  });

  test('clean.parsed_text with any property should return true ', (t) => {
    const req = {
      clean: {
        parsed_text: {
          property2: 'value2',
          property3: 'value3'
        }
      }
    };

    t.ok(has_any_parsed_text_property('property1', 'property3')(req));
    t.end();

  });

};

module.exports.tests.false_conditions = (test, common) => {
  test('undefined request should return false', (t) => {
    t.notOk(has_any_parsed_text_property('property')());
    t.end();

  });

  test('undefined request.clean should return false', (t) => {
    const req = {};

    t.notOk(has_any_parsed_text_property('property')(req));
    t.end();

  });

  test('undefined request.clean.parsed_text should return false', (t) => {
    const req = {
      clean: {}
    };

    t.notOk(has_any_parsed_text_property('property')(req));
    t.end();

  });

  test('request.clean.parsed_text with none of the supplied properties should return false', (t) => {
    const req = {
      clean: {
        parsed_text: {}
      }
    };

    t.notOk(has_any_parsed_text_property('property1', 'property2')(req));
    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`GET /has_any_parsed_text_property ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
