module.exports = {
  'query': {
    'bool': {
      'must': [
        {
          'match': {
            'name.default': {
              'query': 'test',
              'boost': 1,
              'analyzer': 'peliasQueryFullToken',
              'minimum_should_match': '1<-1 3<-25%',
              'cutoff_frequency': 0.01
            }
          }
        }
      ],
      'should': [{
        'match': {
          'phrase.default': {
            'query': 'test',
            'analyzer': 'peliasPhrase',
            'cutoff_frequency': 0.01,
            'type': 'phrase',
            'boost': 1,
            'slop': 2
          }
        }
      },{
        'function_score': {
          'query': {
            'match': {
              'phrase.default': {
                'query': 'test',
                'analyzer': 'peliasPhrase',
                'cutoff_frequency': 0.01,
                'type': 'phrase',
                'slop': 2,
                'boost': 1
              }
            }
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
      },{
        'function_score': {
          'query': {
            'match': {
              'phrase.default': {
                'query': 'test',
                'analyzer': 'peliasPhrase',
                'cutoff_frequency': 0.01,
                'type': 'phrase',
                'slop': 2,
                'boost': 1
              }
            }
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
            'weight': 2
          }]
        }
      }],
      'filter': [
        {
          'terms': {
            'layer': [
              'test'
            ]
          }
        },
        {
          'multi_match': {
            'fields': [
              'parent.*_id'
            ],
            'query': '123'
          }
        }
      ]
    }
  },
  'sort': [ '_score' ],
  'size': 10,
  'track_scores': true
};
