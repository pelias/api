const _ = require('lodash');
const isAdminOnlyAnalysis = require('../../../../controller/predicates/isAdminOnlyAnalysis');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    t.equal(typeof isAdminOnlyAnalysis, 'function', 'isAdminOnlyAnalysis is a function');
    t.end();
  });
};

module.exports.tests.true_conditions = (test, common) => {
  test('parsed_text with admin-only properties should return true', (t) => {
    ['neighbourhood', 'borough', 'city', 'county', 'state', 'country'].forEach((property) => {
      const req = {
        clean: {
          parsed_text: {}
        }
      };
      const res = {};

      req.clean.parsed_text[property] = `${property} value`;

      t.ok(isAdminOnlyAnalysis(req, res));

    });
    t.end();

  });

};

module.exports.tests.false_conditions = (test, common) => {
  test('req.clean with no parsed_text should return false', (t) => {
    const req = {
      clean: {
      }
    };
    const res = {};

    t.notOk(isAdminOnlyAnalysis(req, res));
    t.end();

  });

  test('parsed_text with non-admin properties should return false', (t) => {
    ['unit', 'housenumber', 'street', 'query', 'category', 'postalcode'].forEach((property) => {
      const req = {
        clean: {
          parsed_text: {
            [property]: `${property} value`
          }
        }
      };
      const res = {};

      t.notOk(isAdminOnlyAnalysis(req, res));

    });
    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`isAdminOnlyAnalysis ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
