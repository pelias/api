var vs = require('../../../query/autocomplete_defaults');

module.exports = {
  'query': {
    'filtered': {
      'query': {
        'bool': {
          'must': [{
            'match': {
              'name.default': {
                'analyzer': 'peliasPhrase',
                'boost': 1,
                'query': 'test',
                'type': 'phrase',
                'operator': 'and'
              }
            }
          }],
          'should': [{
            'function_score': {
              'query': {
                'match': {
                  'name.default': {
                    'analyzer': 'peliasPhrase',
                    'boost': 1,
                    'query': 'test',
                    'type': 'phrase',
                    'operator': 'and'
                  }
                }
              },
              'functions': [{
                'linear': {
                  'center_point': {
                    'origin': {
                      'lat': 0,
                      'lon': 0
                    },
                    'offset': '1km',
                    'scale': '50km',
                    'decay': 0.5
                  }
                },
                'weight': 2
              }],
              'score_mode': 'avg',
              'boost_mode': 'replace',
              'filter': {
                'or': [
                  {
                    'type': {
                      'value': 'osmnode'
                    }
                  },
                  {
                    'type': {
                      'value': 'osmway'
                    }
                  },
                  {
                    'type': {
                      'value': 'osmaddress'
                    }
                  },
                  {
                    'type': {
                      'value': 'openaddresses'
                    }
                  }
                ]
              }
            }
          },{
            'function_score': {
              'query': {
                'match': {
                  'name.default': {
                    'analyzer': 'peliasPhrase',
                    'query': 'test',
                    'operator': 'and'
                  }
                }
              },
              'max_boost': 20,
              'score_mode': 'first',
              'boost_mode': 'replace',
              'filter': {
                'exists': {
                  'field': 'popularity'
                }
              },
              'functions': [{
                'field_value_factor': {
                  'modifier': 'log1p',
                  'field': 'popularity'
                },
                'weight': 1
              }]
            }
          },{
            'function_score': {
              'query': {
                'match': {
                  'name.default': {
                    'analyzer': 'peliasPhrase',
                    'query': 'test',
                    'operator': 'and'
                  }
                }
              },
              'max_boost': 20,
              'score_mode': 'first',
              'boost_mode': 'replace',
              'filter': {
                'exists': {
                  'field': 'population'
                }
              },
              'functions': [{
                'field_value_factor': {
                  'modifier': 'log1p',
                  'field': 'population'
                },
                'weight': 2
              }]
            }
          }]
        }
      }
    }
  },
  'sort': [ '_score' ],
  'size': vs.size,
  'track_scores': true
};
