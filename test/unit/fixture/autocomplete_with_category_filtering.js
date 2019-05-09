module.exports = {
  'query': {
    'bool': {
      'must': [{
        'constant_score': {
          'query': {
            'match': {
              'name.default': {
                'analyzer': 'peliasQueryPartialToken',
                'cutoff_frequency': 0.01,
                'boost': 100,
                'query': 'test',
                'fuzziness': 1,
                'prefix_length': 1,
                'max_expansions': 10,
                'operator': 'and'
              }
            }
          }
        }
      }],
      'should': [{
        'function_score': {
          'query': {
            'match_all': {}
          },
          'max_boost': 20,
          'score_mode': 'first',
          'boost_mode': 'replace',
          'functions': [{
            'field_value_factor': {
              'modifier': 'log1p',
              'field': 'popularity',
              'missing': 1
            },
            'weight': 1
          }]
        }
      }, {
        'function_score': {
          'query': {
            'match_all': {}
          },
          'max_boost': 20,
          'score_mode': 'first',
          'boost_mode': 'replace',
          'functions': [{
            'field_value_factor': {
              'modifier': 'log1p',
              'field': 'population',
              'missing': 1
            },
            'weight': 3
          }]
        }
      }],
      'filter': [{
        'terms': {
          'category': ['retail', 'food']
        }
      }]
    }
  },
  'sort': ['_score'],
  'size': 20,
  'track_scores': true
};
