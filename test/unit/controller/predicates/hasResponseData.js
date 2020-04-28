const _ = require('lodash');
const hasResponseData = require('../../../../controller/predicates/hasResponseData');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    t.equal(typeof hasResponseData, 'function', 'hasResponseData is a function');
    t.end();
  });
};

module.exports.tests.true_conditions = (test, common) => {
  test('response with non-empty data should return true', (t) => {
    const req = {};
    const res = {
      data: [1]
    };

    t.ok(hasResponseData(req, res));
    t.end();

  });

};

module.exports.tests.false_conditions = (test, common) => {
  test('response with undefined data should return true', (t) => {
    const req = {};
    const res = {};

    t.notOk(hasResponseData(req, res));
    t.end();

  });

  test('response with empty data array should return true', (t) => {
    const req = {};
    const res = {
      data: []
    };

    t.notOk(hasResponseData(req, res));
    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`hasResponseData ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
