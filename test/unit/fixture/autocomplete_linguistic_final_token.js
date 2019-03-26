module.exports = {
  'query': {
    'bool': {
      'must': [{
        'match': {
          'name.default': {
            'analyzer': 'peliasQueryFullToken',
            'cutoff_frequency': 0.01,
            'boost': 1,
            'slop': 3,
            'fuzziness': 1,
            'prefix_length': 1,
            'max_expansions': 10,
            'query': 'one'
          }
        }
      }],
      'should':[{
        'match': {
          'phrase.default': {
            'analyzer': 'peliasPhrase',
            'cutoff_frequency': 0.01,
            'boost': 1,
            'slop': 3,
            'fuzziness': 1,
            'query': 'one',
            'type': 'phrase'
          }
        }
      },{
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
      },{
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
  'sort': [ '_score' ],
  'size': 20,
  'track_scores': true
};
