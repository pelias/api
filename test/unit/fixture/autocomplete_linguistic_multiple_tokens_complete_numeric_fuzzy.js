module.exports = {
  'query': {
    'bool': {
      'must': [{
        'multi_match': {
          'fields': ['phrase.default', 'phrase.en'],
          'analyzer': 'peliasQuery',
          'type': 'best_fields',
          'operator': 'and',
          'fuzziness': 2,
          'max_expansions': 30,
          'prefix_length': 1,
          'boost': 1,
          'query': '1 2'
        }
      },
      {
        'constant_score': {
          'filter': {
            'multi_match': {
              'fields': ['name.default', 'name.en'],
              'analyzer': 'peliasQuery',
              'query': 'three',
              'boost': 100,
              'type': 'best_fields',
              'operator': 'and',
              'fuzziness': 2,
              'max_expansions': 30,
              'prefix_length': 1
            }
          }
        }
      }],
      'should': [
        {
          'multi_match': {
            'type': 'phrase',
            'query': '1 2',
            'fields': [
              'phrase.default',
              'phrase.en'
            ],
            'analyzer': 'peliasQuery',
            'boost': 1,
            'slop': 3
          }
        },
        {
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
        }]
    }
  },
  'sort': ['_score'],
  'size': 20,
  'track_scores': true
};
