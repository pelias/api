module.exports = {
  'query': {
    'bool': {
      'must': [{
        'constant_score': {
          'filter': {
            'multi_match': {
              'fields': ['name.default^100', 'name.en^100'],
              'analyzer': 'peliasQuery',
              'query': 'test',
              'cutoff_frequency': 0.01,
              'type': 'phrase',
              'operator': 'and',
              'slop': 3
            }
          }
        }
      }],
      'should': [{
        'function_score': {
          'query': {
            'multi_match': {
              'fields': ['name.default^100', 'name.en^100'],
              'analyzer': 'peliasQuery',
              'cutoff_frequency': 0.01,
              'query': 'test',
              'type': 'phrase',
              'operator': 'and',
              'slop': 3
            }
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
      }]
    }
  },
  'sort': [ '_score' ],
  'size': 20,
  'track_scores': true
};
