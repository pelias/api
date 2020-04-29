const _ = require('lodash');
const hasRequestErrors = require('../../../../controller/predicates/hasRequestErrors');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    t.equal(typeof hasRequestErrors, 'function', 'hasRequestErrors is a function');
    t.end();
  });
};

module.exports.tests.true_conditions = (test, common) => {
  test('request with non-empty errors should return true', (t) => {
    const req = {
      errors: ['error']
    };
    const res = {};

    t.ok(hasRequestErrors(req, res));
    t.end();

  });

};

module.exports.tests.false_conditions = (test, common) => {
  test('response with undefined errors should return false', (t) => {
    const req = {};
    const res = {};

    t.notOk(hasRequestErrors(req, res));
    t.end();

  });

  test('response with empty errors array should return false', (t) => {
    const req = {
      errors: []
    };
    const res = {};

    t.notOk(hasRequestErrors(req, res));
    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`hasRequestErrors ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
