
module.exports = {
  'query': {
    'filtered': {
      'query': {
        'bool': {
          'must': [{
            'match': {
              'name.default': {
                'analyzer': 'peliasPhrase',
                'boost': 100,
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
                    'boost': 100,
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
                    'offset': '0km',
                    'scale': '250km',
                    'decay': 0.5
                  }
                },
                'weight': 10
              }],
              'score_mode': 'avg',
              'boost_mode': 'multiply',
              'filter': {
                'or': [
                  {
                    'term': {
                      'layer': 'venue'
                    }
                  },
                  {
                    'term': {
                      'layer': 'address'
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
                    'boost': 100,
                    'query': 'test',
                    'type': 'phrase',
                    'operator': 'and'
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
                  'name.default': {
                    'analyzer': 'peliasPhrase',
                    'boost': 100,
                    'query': 'test',
                    'type': 'phrase',
                    'operator': 'and'
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
                'weight': 3
              }]
            }
          }]
        }
      }
    }
  },
  'sort': [ '_score' ],
  'size': 20,
  'track_scores': true
};
