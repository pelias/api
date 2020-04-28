const _ = require('lodash');
const isRequestSourcesOnlyWhosOnFirst = require('../../../../controller/predicates/isRequestSourcesOnlyWhosOnFirst');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    t.ok(_.isFunction(isRequestSourcesOnlyWhosOnFirst), 'isRequestSourcesOnlyWhosOnFirst is a function');
    t.end();
  });
};

module.exports.tests.true_conditions = (test, common) => {
  test('sources only \'whosonfirst\' should return true', (t) => {
    const req = {
      clean: {
        sources: [
          'whosonfirst'
        ]
      }
    };

    t.ok(isRequestSourcesOnlyWhosOnFirst(req));
    t.end();

  });

};

module.exports.tests.false_conditions = (test, common) => {
  test('undefined req should return false', (t) => {
    t.notOk(isRequestSourcesOnlyWhosOnFirst(undefined));
    t.end();

  });

  test('undefined req.clean should return false', (t) => {
    const req = {};

    t.notOk(isRequestSourcesOnlyWhosOnFirst(req));
    t.end();

  });

  test('undefined req.clean.sources should return false', (t) => {
    const req = {
      clean: {}
    };

    t.notOk(isRequestSourcesOnlyWhosOnFirst(req));
    t.end();

  });

  test('empty req.clean.sources should return false', (t) => {
    const req = {
      clean: {
        sources: []
      }
    };

    t.notOk(isRequestSourcesOnlyWhosOnFirst(req));
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

    t.notOk(isRequestSourcesOnlyWhosOnFirst(req));
    t.end();

  });

  test('sources other than \'whosonfirst\' should return false', (t) => {
    const req = {
      clean: {
        sources: [
          'whosonfirst', 'not whosonfirst'
        ]
      }
    };

    t.notOk(isRequestSourcesOnlyWhosOnFirst(req));
    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`isRequestSourcesOnlyWhosOnFirst ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
