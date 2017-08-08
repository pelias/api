'use strict';

const _ = require('lodash');
const has_parsed_text_properties = require('../../../../controller/predicates/has_parsed_text_properties');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    t.ok(_.isFunction(has_parsed_text_properties.all), 'has_parsed_text_properties.all is a function');
    t.ok(_.isFunction(has_parsed_text_properties.any), 'has_parsed_text_properties.any is a function');
    t.end();
  });

};

module.exports.tests.true_conditions = (test, common) => {
  test('all: defined request.clean.parsed_text.property should return true', (t) => {
    const req = {
      clean: {
        parsed_text: {
          property: 'value'
        }
      }
    };

    t.ok(has_parsed_text_properties.all('property')(req));
    t.end();

  });

  test('all: clean.parsed_text with any property should return true ', (t) => {
    const req = {
      clean: {
        parsed_text: {
          property1: 'value1',
          property2: 'value2'
        }
      }
    };

    t.ok(has_parsed_text_properties.all('property2', 'property1')(req));
    t.end();

  });

  test('any: defined request.clean.parsed_text.property should return true', (t) => {
    const req = {
      clean: {
        parsed_text: {
          property: 'value'
        }
      }
    };

    t.ok(has_parsed_text_properties.any('property')(req));
    t.end();

  });

  test('any: clean.parsed_text with any property should return true ', (t) => {
    const req = {
      clean: {
        parsed_text: {
          property2: 'value2',
          property3: 'value3'
        }
      }
    };

    t.ok(has_parsed_text_properties.any('property1', 'property3')(req));
    t.end();

  });

};

module.exports.tests.false_conditions = (test, common) => {
  test('all: undefined request should return false', (t) => {
    t.notOk(has_parsed_text_properties.all('property')());
    t.end();

  });

  test('all: undefined request.clean should return false', (t) => {
    const req = {};

    t.notOk(has_parsed_text_properties.all('property')(req));
    t.end();

  });

  test('all: undefined request.clean.parsed_text should return false', (t) => {
    const req = {
      clean: {}
    };

    t.notOk(has_parsed_text_properties.all('property')(req));
    t.end();

  });

  test('all: request.clean.parsed_text with none of the supplied properties should return false', (t) => {
    const req = {
      clean: {
        parsed_text: {
          property1: 'value1'
        }
      }
    };

    t.notOk(has_parsed_text_properties.all('property1', 'property2')(req));
    t.end();

  });

  test('any: undefined request should return false', (t) => {
    t.notOk(has_parsed_text_properties.any('property')());
    t.end();

  });

  test('any: undefined request.clean should return false', (t) => {
    const req = {};

    t.notOk(has_parsed_text_properties.any('property')(req));
    t.end();

  });

  test('any: undefined request.clean.parsed_text should return false', (t) => {
    const req = {
      clean: {}
    };

    t.notOk(has_parsed_text_properties.any('property')(req));
    t.end();

  });

  test('any: request.clean.parsed_text with none of the supplied properties should return false', (t) => {
    const req = {
      clean: {
        parsed_text: {}
      }
    };

    t.notOk(has_parsed_text_properties.any('property1', 'property2')(req));
    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`GET /has_parsed_text_properties ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
