const _ = require('lodash');
const isRequestSourcesUndefined = require('../../../../controller/predicates/isRequestSourcesUndefined');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    t.ok(_.isFunction(isRequestSourcesUndefined), 'isRequestSourcesUndefined is a function');
    t.end();
  });
};

module.exports.tests.true_conditions = (test, common) => {
  test('undefined req should return true', (t) => {

    t.ok(isRequestSourcesUndefined(undefined));
    t.end();

  });

  test('undefined req.clean should return true', (t) => {
    const req = {};

    t.ok(isRequestSourcesUndefined(req));
    t.end();

  });

  test('undefined req.clean.sources should return true', (t) => {
    const req = {
      clean: {}
    };

    t.ok(isRequestSourcesUndefined(req));
    t.end();

  });

  test('empty req.clean.sources should return true', (t) => {
    const req = {
      clean: {
        sources: []
      }
    };

    t.ok(isRequestSourcesUndefined(req));
    t.end();

  });

};

module.exports.tests.false_conditions = (test, common) => {
  test('sources not empty should return false', (t) => {
    const req = {
      clean: {
        sources: [
          'not empty'
        ]
      }
    };

    t.notOk(isRequestSourcesUndefined(req));
    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`isRequestSourcesUndefined ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
