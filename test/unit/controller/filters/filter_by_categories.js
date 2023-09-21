'use strict';

const _ = require('lodash');
const filter_by_categories = require('../../../../controller/filters/filter_by_categories');

module.exports.tests = {};

module.exports.tests.interface = (test, common) => {
  test('valid interface', (t) => {
    t.equal(typeof filter_by_categories, 'function', 'filter_by_categories is a function');
    t.end();
  });
};

module.exports.tests.true_conditions = (test, common) => {
  test('successfully moves categories from category to category_filter', (t) => {
    const testSubject = {
      body: {
        query: {
          bool: {
            filter: [
              {
                terms: {
                  category: ['foo']
                }
              }
            ]
          }
        }
      }
    };

    filter_by_categories({ query: {}}, testSubject);
    

    t.deepEqual(testSubject.body.query.bool.filter, [
      {
        terms: {
          category_filter: ['foo']
        }
      }
      ], 'category_filter was added to the filter array and category was removed');

    t.end();

  });
}

module.exports.tests.true_conditions = (test, common) => {
  test('leaves other filters intact', (t) => {
    const testSubject = {
      body: {
        query: {
          bool: {
            filter: [
              {
                terms: {
                  category: ['foo'],
                }
              },
              {
                terms: {
                  bar: ['baz']
                }
              }
            ]
          }
        }
      }
    };

    filter_by_categories({ query: {}}, testSubject);
    

    t.deepEqual(testSubject.body.query.bool.filter, [
      {
        terms: {
          bar: ['baz']
        }
      },
      {
        terms: {
          category_filter: ['foo'],
        }
      }
      ], 'category_filter was added to the filter array and category was removed');

    t.end();

  });
}

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`GET /filter_by_categories ${name}`, testFunction);
  }

  for( const testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
