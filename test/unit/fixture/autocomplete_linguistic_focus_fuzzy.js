module.exports = {
  'query': {
    'bool': {
      'must': [{
        'constant_score': {
          'filter': {
            'multi_match': {
              'fields': ['name.default', 'name.en'],
              'analyzer': 'peliasQuery',
              'query': 'test',
              'boost': 100,
              'type': 'best_fields',
              'operator': 'and',
              'fuzziness': 1,
              'max_expansions': 40,
              'prefix_length': 1
            }
          }
        }
      }],
      'should': [{
        'function_score': {
          'query': {
            'match_all': {}
          },
          'functions': [{
            'exp': {
              'center_point': {
                'origin': {
                  'lat': 29.49136,
                  'lon': -82.50622
                },
                'offset': '0km',
                'scale': '50km',
                'decay': 0.5
              }
            },
            'weight': 15
          }],
          'score_mode': 'avg',
          'boost_mode': 'replace'
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
      }],
      'filter': [{
        'bool': {
          'minimum_should_match': 1,
          'should': [
            {
              'terms': {
                'layer': [
                  'venue',
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
            },
            {
              'geo_distance': {
                'distance': '600km',
                'distance_type': 'plane',
                'center_point': {
                  'lat': 29.49136,
                  'lon': -82.50622
                }
              }
            }
          ]
        }
      }]
    }
  },
  'sort': [ '_score' ],
  'size': 20,
  'track_scores': true
};
