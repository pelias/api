const _ = require('lodash');
const is_request_sources_undefined = require('../../../../controller/predicates/is_request_sources_undefined');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    t.ok(_.isFunction(is_request_sources_undefined), 'is_request_sources_undefined is a function');
    t.end();
  });
};

module.exports.tests.true_conditions = (test, common) => {
  test('undefined req should return true', (t) => {

    t.ok(is_request_sources_undefined(undefined));
    t.end();

  });

  test('undefined req.clean should return true', (t) => {
    const req = {};

    t.ok(is_request_sources_undefined(req));
    t.end();

  });

  test('undefined req.clean.sources should return true', (t) => {
    const req = {
      clean: {}
    };

    t.ok(is_request_sources_undefined(req));
    t.end();

  });

  test('empty req.clean.sources should return true', (t) => {
    const req = {
      clean: {
        sources: []
      }
    };

    t.ok(is_request_sources_undefined(req));
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

    t.notOk(is_request_sources_undefined(req));
    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`GET /is_request_sources_undefined ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
