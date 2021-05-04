module.exports = {
  'query': {
    'bool': {
      'must': [
        {
          'constant_score': {
            'query': {
              'match': {
                'name.default': {
                  'analyzer': 'peliasQueryPartialToken',
                  'boost': 100,
                  'query': 'BussForTog',
                  'type': 'phrase',
                  'operator': 'and',
                  'slop': 3,
                  'fuzziness': 1
                }
              }
            }
          }
        }
      ],
      'should': [
        {
          'function_score': {
            'query': {
              'match_all': {}
            },
            'max_boost': 20,
            'functions': [
              {
                'field_value_factor': {
                  'modifier': 'log1p',
                  'field': 'popularity',
                  'missing': 1
                },
                'weight': 1
              }
            ],
            'score_mode': 'first',
            'boost_mode': 'replace'
          }
        },
        {
          'function_score': {
            'query': {
              'match_all': {}
            },
            'max_boost': 20,
            'functions': [
              {
                'field_value_factor': {
                  'modifier': 'log1p',
                  'field': 'population',
                  'missing': 1
                },
                'weight': 3
              }
            ],
            'score_mode': 'first',
            'boost_mode': 'replace'
          }
        }
      ],
      'filter': {
        'bool': {
          'must_not': {
            'bool': {
              'filter': [
                {
                  'terms': {
                    'category': ['railReplacementBus']
                  }
                }
              ],
              'must': {
                'script': {
                  'script': {
                    'inline': 'doc[\"category\"].values.size() == 1',
                    'lang': 'groovy'
                  }
                }
              }
            }
            
          },
          'must': []
        }
      }
    }
  },
  'size': 20,
  'track_scores': true,
  'sort': [
    '_score'
  ]
};
