const _ = require('lodash');
const is_pelias_parse = require('../../../../controller/predicates/is_pelias_parse');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', t => {
    t.ok(_.isFunction(is_pelias_parse), 'is_pelias_parse is a function');
    t.end();
  });
};

module.exports.tests.true_conditions = (test, common) => {
  test('request.clean.parser=pelias should return true', t => {
    const req = {
      clean: {
        parser: 'pelias'
      }
    };

    t.ok(is_pelias_parse(req));
    t.end();

  });

};

module.exports.tests.false_conditions = (test, common) => {
  test('undefined request should return false', t => {
    t.notOk(is_pelias_parse(undefined));
    t.end();
  });

  test('undefined request.clean should return false', t => {
    const req = {};

    t.notOk(is_pelias_parse(req));
    t.end();
  });

  test('undefined request.clean.parser should return false', t => {
    const req = {
      clean: {}
    };

    t.notOk(is_pelias_parse(req));
    t.end();
  });

  test('non-\'pelias\' request.clean.parser should return false', t => {
    const req = {
      clean: {
        parser: 'not pelias'
      }
    };

    t.notOk(is_pelias_parse(req));
    t.end();
  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`GET /is_pelias_parse ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
