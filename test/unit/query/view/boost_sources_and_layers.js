const query = require('pelias-query');
const vs = new query.Vars(require('../../../../query/search_defaults'));
const boost_sources_and_layers = require('../../../../query/view/boost_sources_and_layers');

module.exports.tests = {};

module.exports.tests.empty_config = function(test, common) {
  test('empty configuration returns empty query', function(t) {
    const view = boost_sources_and_layers({});
    const rendered = view(vs);
    t.equal(rendered, null, 'query is empty');
    t.end();
  });

  test('undefined configuration returns empty query', function(t) {
    const view = boost_sources_and_layers(undefined);
    const rendered = view(vs);
    t.equal(rendered, null, 'query is empty');
    t.end();
  });
};

module.exports.tests.single_item_config = function(test, common) {
  test('config with single layer entry produces a single scoring function with weight', function(t) {
    const config = {
      layer: {
        locality: 5
      }
    };
    const expected_query = {
      'function_score': {
        'query': {
          'match_all': {}
        },
        'functions': [{
          'filter': {
            'match': {
              'layer': 'locality'
            }
          },
          'weight': 5
        }],
        'boost':      vs.var('custom:boosting:boost'),
        'max_boost':  vs.var('custom:boosting:max_boost'),
        'score_mode': vs.var('custom:boosting:score_mode'),
        'boost_mode': vs.var('custom:boosting:boost_mode'),
        'min_score':  vs.var('custom:boosting:min_score')
      }
    };

    const view = boost_sources_and_layers(config);

    t.deepEquals(view(vs), expected_query, 'query contains a single scoring function');
    t.end();
  });
};

module.exports.tests.mulitple_item_config = function(test, common) {
  test('config with multiple items produces multiple scoring functions', function(t) {
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
      'function_score': {
        'query': {
          'match_all': {}
        },
        'functions': [{
          'filter': {
            'match': {
              'source': 'whosonfirst'
            }
          },
          'weight': 6
        },{
          'filter': {
            'match': {
              'layer': 'country'
            }
          },
          'weight': 2
        },{
          'filter': {
            'match': {
              'layer': 'borough'
            }
          },
          'weight': 0.5
        }],
        'boost':      vs.var('custom:boosting:boost'),
        'max_boost':  vs.var('custom:boosting:max_boost'),
        'score_mode': vs.var('custom:boosting:score_mode'),
        'boost_mode': vs.var('custom:boosting:boost_mode'),
        'min_score':  vs.var('custom:boosting:min_score')
      }
    };
    const view = boost_sources_and_layers(config);

    t.deepEquals(view(vs), expected_query, 'query contains multiple scoring functions');
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
