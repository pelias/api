const _ = require('lodash');
const isRequestSourcesIncludesWhosOnFirst = require('../../../../controller/predicates/isRequestSourcesIncludesWhosOnFirst');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    t.ok(_.isFunction(isRequestSourcesIncludesWhosOnFirst), 'isRequestSourcesIncludesWhosOnFirst is a function');
    t.end();
  });
};

module.exports.tests.true_conditions = (test, common) => {
  test('sources includes \'whosonfirst\' should return true', (t) => {
    const req = {
      clean: {
        sources: [
          'whosonfirst',
          'not whosonfirst'
        ]
      }
    };

    t.ok(isRequestSourcesIncludesWhosOnFirst(req));
    t.end();

  });

  test('empty req.clean.sources should return false', (t) => {
    const req = {
      clean: {
        sources: []
      }
    };

    t.notOk(isRequestSourcesIncludesWhosOnFirst(req));
    t.end();

  });

};

module.exports.tests.false_conditions = (test, common) => {
  test('undefined req should return false', (t) => {
    t.notOk(isRequestSourcesIncludesWhosOnFirst(undefined));
    t.end();

  });

  test('undefined req.clean should return false', (t) => {
    const req = {};

    t.notOk(isRequestSourcesIncludesWhosOnFirst(req));
    t.end();

  });

  test('undefined req.clean.sources should return false', (t) => {
    const req = {
      clean: {}
    };

    t.notOk(isRequestSourcesIncludesWhosOnFirst(req));
    t.end();

  });

  test('sources not \'whosonfirst\' should return false', (t) => {
    const req = {
      clean: {
        sources: [
          'not whosonfirst'
        ]
      }
    };

    t.notOk(isRequestSourcesIncludesWhosOnFirst(req));
    t.end();
  });
};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`isRequestSourcesIncludesWhosOnFirst ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
