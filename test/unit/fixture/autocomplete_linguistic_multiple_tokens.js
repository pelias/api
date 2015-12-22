
module.exports = {
  'query': {
    'filtered': {
      'query': {
        'bool': {
          'must': [{
            'match': {
              'phrase.default': {
                'analyzer': 'peliasPhrase',
                'type': 'phrase',
                'boost': 1,
                'slop': 2,
                'query': 'one two'
              }
            }
          },
          {
            'match': {
              'name.default': {
                'analyzer': 'peliasPhrase',
                'boost': 100,
                'query': 'three',
                'type': 'phrase',
                'operator': 'and'
              }
            }
          }],
          'should':[{
            'function_score': {
              'query': {
                'match': {
                  'name.default': {
                    'analyzer': 'peliasPhrase',
                    'query': 'one two three',
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
                    'query': 'one two three',
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
  'size': 20,
  'track_scores': true
};
