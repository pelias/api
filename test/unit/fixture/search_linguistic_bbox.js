
module.exports = {
  'query': {
    'filtered': {
      'query': {
        'bool': {
          'must': [{
            'match': {
              'name.default': {
                'query': 'test',
                'boost': 1,
                'analyzer': 'peliasOneEdgeGram'
              }
            }
          }],
          'should': [{
            'match': {
              'phrase.default': {
                'query': 'test',
                'analyzer': 'peliasPhrase',
                'type': 'phrase',
                'boost': 1,
                'slop': 2
              }
            }
          },
          {
            'function_score': {
              'query': {
                'filtered': {
                  'filter': {
                    'exists': {
                      'field': 'popularity'
                    }
                  }
                }
              },
              'max_boost': 2,
              'score_mode': 'first',
              'boost_mode': 'replace',
              'filter': {
                'or': [
                  {
                    'type': {
                      'value': 'admin0'
                    }
                  },
                  {
                    'type': {
                      'value': 'admin1'
                    }
                  },
                  {
                    'type': {
                      'value': 'admin2'
                    }
                  }
                ]
              },
              'functions': [{
                'field_value_factor': {
                  'modifier': 'sqrt',
                  'field': 'popularity'
                },
                'weight': 1
              }]
            }
          }]
        }
      },
      'filter': {
        'bool': {
          'must': [{
            'geo_bounding_box': {
              'center_point': {
                'top': 11.51,
                'right': -61.84,
                'bottom': 47.47,
                'left': -103.16
              },
              '_cache': true,
              'type': 'indexed'
            }
          }]
        }
      }
    }
  },
  'sort': [ '_sort' ],
  'size': 10,
  'track_scores': true
};