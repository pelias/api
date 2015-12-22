
module.exports = {
  'query': {
    'filtered': {
      'query': {
        'bool': {
          'must': [
            {
              'match': {
                'phrase.default': {
                  'analyzer': 'peliasPhrase',
                  'type': 'phrase',
                  'boost': 1,
                  'slop': 2,
                  'query': 'one two'
                }
              }
            }
          ],
          'should': [
            {
              'match': {
                'admin0': {
                  'analyzer': 'peliasAdmin',
                  'boost': 4,
                  'query': 'three'
                }
              }
            },
            {
              'match': {
                'admin1': {
                  'analyzer': 'peliasAdmin',
                  'boost': 3,
                  'query': 'three'
                }
              }
            },
            {
              'match': {
                'admin1_abbr': {
                  'analyzer': 'peliasAdmin',
                  'boost': 3,
                  'query': 'three'
                }
              }
            },
            {
              'match': {
                'admin2': {
                  'analyzer': 'peliasAdmin',
                  'boost': 2,
                  'query': 'three'
                }
              }
            },
            {
              'match': {
                'local_admin': {
                  'analyzer': 'peliasAdmin',
                  'boost': 1,
                  'query': 'three'
                }
              }
            },
            {
              'match': {
                'locality': {
                  'analyzer': 'peliasAdmin',
                  'boost': 1,
                  'query': 'three'
                }
              }
            },
            {
              'match': {
                'neighborhood': {
                  'analyzer': 'peliasAdmin',
                  'boost': 1,
                  'query': 'three'
                }
              }
            },
            {
              'function_score': {
                'query': {
                  'match': {
                    'name.default': {
                      'analyzer': 'peliasPhrase',
                      'query': 'one two',
                      'operator': 'and'
                    }
                  }
                },
                'max_boost': 20,
                'functions': [
                  {
                    'field_value_factor': {
                      'modifier': 'log1p',
                      'field': 'popularity'
                    },
                    'weight': 1
                  }
                ],
                'score_mode': 'first',
                'boost_mode': 'replace',
                'filter': {
                  'exists': {
                    'field': 'popularity'
                  }
                }
              }
            },
            {
              'function_score': {
                'query': {
                  'match': {
                    'name.default': {
                      'analyzer': 'peliasPhrase',
                      'query': 'one two',
                      'operator': 'and'
                    }
                  }
                },
                'max_boost': 20,
                'functions': [
                  {
                    'field_value_factor': {
                      'modifier': 'log1p',
                      'field': 'population'
                    },
                    'weight': 2
                  }
                ],
                'score_mode': 'first',
                'boost_mode': 'replace',
                'filter': {
                  'exists': {
                    'field': 'population'
                  }
                }
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
