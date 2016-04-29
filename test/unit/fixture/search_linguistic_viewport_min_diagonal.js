module.exports = {
  'query': {
    'filtered': {
      'query': {
        'bool': {
          'must': [
            {
              'match': {
                'name.default': {
                  'analyzer': 'peliasIndexOneEdgeGram',
                  'boost': 1,
                  'query': 'test'
                }
              }
            }
          ],
          'should': [
            {
              'match': {
                'phrase.default': {
                  'analyzer': 'peliasPhrase',
                  'type': 'phrase',
                  'boost': 1,
                  'slop': 2,
                  'query': 'test'
                }
              }
            },
            {
              'function_score': {
                'query': {
                  'match': {
                    'phrase.default': {
                      'analyzer': 'peliasPhrase',
                      'type': 'phrase',
                      'boost': 1,
                      'slop': 2,
                      'query': 'test'
                    }
                  }
                },
                'functions': [
                  {
                    'weight': 2,
                    'linear': {
                      'center_point': {
                        'origin': {
                          'lat': 28.49136,
                          'lon': -87.50623
                        },
                        'offset': '1km',
                        'scale': '1km',
                        'decay': 0.5
                      }
                    }
                  }
                ],
                'score_mode': 'avg',
                'boost_mode': 'replace'
              }
            },
            {
              'function_score': {
                'query': {
                  'match': {
                    'phrase.default': {
                      'analyzer': 'peliasPhrase',
                      'type': 'phrase',
                      'boost': 1,
                      'slop': 2,
                      'query': 'test'
                    }
                  }
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
                  'match': {
                    'phrase.default': {
                      'analyzer': 'peliasPhrase',
                      'type': 'phrase',
                      'boost': 1,
                      'slop': 2,
                      'query': 'test'
                    }
                  }
                },
                'max_boost': 20,
                'functions': [
                  {
                    'field_value_factor': {
                      'modifier': 'log1p',
                      'field': 'population',
                      'missing': 1
                    },
                    'weight': 2
                  }
                ],
                'score_mode': 'first',
                'boost_mode': 'replace'
              }
            }
          ]
        }
      }
    }
  },
  'size': 10,
  'track_scores': true,
  'sort': [
    '_score'
  ]
};
