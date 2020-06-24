module.exports = {
  'query': {
    'bool': {
      'must': [{
        'match': {
          'phrase.default': {
            'analyzer': 'peliasQuery',
            'boost': 1,
            'minimum_should_match': '1<-1 3<-25%',
            'query': '1 2'
          }
        }
      },
      {
        'constant_score': {
          'filter': {
            'match_phrase': {
              'name.default': {
                'analyzer': 'peliasQuery',
                'boost': 100,
                'query': 'three',
                'slop': 3
              }
            }
          }
        }
      }],
      'should': [{
          'match_phrase': {
            'phrase.default': {
              'analyzer': 'peliasQuery',
              'boost': 1,
              'slop': 3,
              'query': '1 2'
            }
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
