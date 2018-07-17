const boost_sources_and_layers = require('../../../../query/view/boost_sources_and_layers');

module.exports.tests = {};

module.exports.tests.empty_config = function(test, common) {
  test('empty configuration returns empty query', function(t) {
    const view_instance = boost_sources_and_layers({});
    const query = view_instance();
    t.equal(query, null, 'query is empty');
    t.end();
  });
};

module.exports.tests.single_item_config = function(test, common) {
  test('config with single layer entry returns single term query with boost', function(t) {
    const config = {
      layer: {
        locality: 5
      }
    };
    const expected_query = {
      constant_score: {
        boost: 5,
        query: {
          term: {
            layer: 'locality'
          }
        }
      }
    };

    const view_instance = boost_sources_and_layers(config);

    t.deepEquals(view_instance(), expected_query, 'query is a single term query');
    t.end();
  });
};

module.exports.tests.mulitple_item_config = function(test, common) {
  test('config with multiple items returns bool query with multiple should conditions', function(t) {
    const config = {
      source: {
        whosonfirst: 6
      },
      layer: {
        country: 2,
        borough: 0.5
      },
    };
    const expected_query = {
      bool: {
        should: [{
          constant_score: {
            boost: 6,
            query: {
              term: {
                source: 'whosonfirst',
              }
            }
          }
        }, {
          constant_score: {
            boost: 2,
            query: {
              term: {
                layer: 'country'
              }
            }
          }
        },{
          constant_score: {
            boost: 0.5,
            query: {
              term: {
                layer: 'borough'
              }
            }
          }
        }]
      }
    };
    const view_instance = boost_sources_and_layers(config);

    t.deepEquals(view_instance(), expected_query, 'query is a bool query with multiple term queres');
    t.end();

  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('boost sources and layers ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
