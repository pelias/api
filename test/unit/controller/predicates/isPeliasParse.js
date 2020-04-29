const _ = require('lodash');
const isPeliasParse = require('../../../../controller/predicates/isPeliasParse');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', t => {
    t.ok(_.isFunction(isPeliasParse), 'isPeliasParse is a function');
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

    t.ok(isPeliasParse(req));
    t.end();

  });

};

module.exports.tests.false_conditions = (test, common) => {
  test('undefined request should return false', t => {
    t.notOk(isPeliasParse(undefined));
    t.end();
  });

  test('undefined request.clean should return false', t => {
    const req = {};

    t.notOk(isPeliasParse(req));
    t.end();
  });

  test('undefined request.clean.parser should return false', t => {
    const req = {
      clean: {}
    };

    t.notOk(isPeliasParse(req));
    t.end();
  });

  test('non-\'pelias\' request.clean.parser should return false', t => {
    const req = {
      clean: {
        parser: 'not pelias'
      }
    };

    t.notOk(isPeliasParse(req));
    t.end();
  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`isPeliasParse ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
