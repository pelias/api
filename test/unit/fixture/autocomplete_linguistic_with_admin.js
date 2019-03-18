module.exports = {
  'query': {
    'bool': {
      'must': [
        {
          'match': {
            'name.default': {
              'analyzer': 'peliasQueryFullToken',
              'type': 'phrase',
              'boost': 1,
              'slop': 3,
              'cutoff_frequency': 0.01,
              'query': 'one two'
            }
          }
        }
      ],
      'should': [
        {
          'match': {
            'parent.country': {
              'analyzer': 'peliasAdmin',
              'boost': 800,
              'cutoff_frequency': 0.01,
              'query': 'three'
            }
          }
        },
        {
          'match': {
            'parent.region': {
              'analyzer': 'peliasAdmin',
              'cutoff_frequency': 0.01,
              'boost': 600,
              'query': 'three'
            }
          }
        },
        {
          'match': {
            'parent.region_a': {
              'analyzer': 'peliasAdmin',
              'cutoff_frequency': 0.01,
              'boost': 600,
              'query': 'three'
            }
          }
        },
        {
          'match': {
            'parent.county': {
              'analyzer': 'peliasAdmin',
              'cutoff_frequency': 0.01,
              'boost': 400,
              'query': 'three'
            }
          }
        },
        {
          'match': {
            'parent.borough': {
              'analyzer': 'peliasAdmin',
              'cutoff_frequency': 0.01,
              'boost': 600,
              'query': 'three'
            }
          }
        },
        {
          'match': {
            'parent.localadmin': {
              'analyzer': 'peliasAdmin',
              'cutoff_frequency': 0.01,
              'boost': 200,
              'query': 'three'
            }
          }
        },
        {
          'match': {
            'parent.locality': {
              'analyzer': 'peliasAdmin',
              'cutoff_frequency': 0.01,
              'boost': 200,
              'query': 'three'
            }
          }
        },
        {
          'match': {
            'parent.neighbourhood': {
              'analyzer': 'peliasAdmin',
              'cutoff_frequency': 0.01,
              'boost': 200,
              'query': 'three'
            }
          }
        },
        {
          'match': {
            'phrase.default': {
              'analyzer' : 'peliasPhrase',
              'cutoff_frequency': 0.01,
              'type' : 'phrase',
              'boost' : 1,
              'slop' : 3,
              'query' : 'one two'
            }
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
      ]
    }
  },
  'size': 20,
  'track_scores': true,
  'sort': [
    '_score'
  ]
};
