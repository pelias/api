
module.exports = {
  'query': {
    'filtered': {
      'query': {
        'bool': {
          'must': [
            {
              'match': {
                'alpha3': {
                  'analyzer': 'standard',
                  'query': 'ABC'
                }
              }
            },
            {
              'match': {
                'phrase.default': {
                  'query': 'test',
                  'analyzer': 'peliasPhrase',
                  'type': 'phrase',
                  'boost': 1,
                  'slop': 2
                }
              }
            }
          ],
          'should': [{
            'function_score': {
              'query': {
                'match': {
                  'phrase.default': {
                    'query': 'test',
                    'analyzer': 'peliasPhrase',
                    'type': 'phrase',
                    'slop': 2,
                    'boost': 1
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
                  'phrase.default': {
                    'query': 'test',
                    'analyzer': 'peliasPhrase',
                    'type': 'phrase',
                    'slop': 2,
                    'boost': 1
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
  'size': 10,
  'track_scores': true
};
