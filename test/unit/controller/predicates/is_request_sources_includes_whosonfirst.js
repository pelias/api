const _ = require('lodash');
const is_request_sources_includes_whosonfirst = require('../../../../controller/predicates/is_request_sources_includes_whosonfirst');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    t.ok(_.isFunction(is_request_sources_includes_whosonfirst), 'is_request_sources_includes_whosonfirst is a function');
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

    t.ok(is_request_sources_includes_whosonfirst(req));
    t.end();

  });

  test('empty req.clean.sources should return false', (t) => {
    const req = {
      clean: {
        sources: []
      }
    };

    t.notOk(is_request_sources_includes_whosonfirst(req));
    t.end();

  });

};

module.exports.tests.false_conditions = (test, common) => {
  test('undefined req should return false', (t) => {
    t.notOk(is_request_sources_includes_whosonfirst(undefined));
    t.end();

  });

  test('undefined req.clean should return false', (t) => {
    const req = {};

    t.notOk(is_request_sources_includes_whosonfirst(req));
    t.end();

  });

  test('undefined req.clean.sources should return false', (t) => {
    const req = {
      clean: {}
    };

    t.notOk(is_request_sources_includes_whosonfirst(req));
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

    t.notOk(is_request_sources_includes_whosonfirst(req));
    t.end();
  });
};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`GET /is_request_sources_includes_whosonfirst ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
