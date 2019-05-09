module.exports = {
  'query': {
    'bool': {
      'must': [{
        'constant_score': {
          'query': {
            'match': {
              'name.default': {
                'analyzer': 'peliasQueryPartialToken',
                'boost': 100,
                'fuzziness': 1,
                'prefix_length': 1,
                'max_expansions': 10,
                'operator': 'and',
                'cutoff_frequency': 0.01,
                'query': 'te'
              }
            }
          }
        }
      }],
      'should':[{
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
      }],
      'filter': [{
        'terms': {
          'layer': [
            'venue',
            'street',
            'country',
            'macroregion',
            'region',
            'county',
            'localadmin',
            'locality',
            'borough',
            'neighbourhood',
            'continent',
            'empire',
            'dependency',
            'macrocounty',
            'macrohood',
            'microhood',
            'disputed',
            'postalcode',
            'ocean',
            'marinearea'
          ]
        }
      }]
    }
  },
  'sort': [ '_score' ],
  'size': 20,
  'track_scores': true
};
