const _ = require('lodash');
const hasRequestParameter = require('../../../../controller/predicates/hasRequestParameter');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', t => {
    t.equal(typeof hasRequestParameter, 'function', 'hasRequestParameter is a function');
    t.end();
  });
};

module.exports.tests.true_conditions = (test, common) => {
  test('request with specified parameter should return true', t => {
    [['foo'], {foo: 'bar'}, 'string value', 0, 17].forEach(val => {
      const req = {
        clean: {
          'parameter name': val
        }
      };

      t.ok(hasRequestParameter('parameter name')(req));

    });

    t.end();

  });

};

module.exports.tests.empty_values = (test, common) => {
  test('request with specified parameter, but empty value, should true', t => {
    [[], {}, '', null, undefined].forEach(val => {
      const req = {
        clean: {
          'parameter name': val
        }
      };

      t.notOk(hasRequestParameter('parameter name')(req));

    });

    t.end();

  });

};

module.exports.tests.false_conditions = (test, common) => {
  test('request with undefined clean should return false', t => {
    const req = {};

    t.notOk(hasRequestParameter('parameter name')(req));
    t.end();

  });

  test('request.clean without specified parameter should return false', t => {
    const req = {
      clean: {}
    };

    t.notOk(hasRequestParameter('parameter name')(req));
    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`hasRequestParameter ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
