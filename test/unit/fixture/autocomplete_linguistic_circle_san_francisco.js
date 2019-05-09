module.exports = {
  'query': {
    'bool': {
      'must': [
        {
          'constant_score': {
            'query': {
              'match': {
                'name.default': {
                  'analyzer': 'peliasQueryPartialToken',
                  'boost': 100,
                  'query': 'test',
                  'fuzziness': 1,
                  'prefix_length': 1,
                  'max_expansions': 10,
                  'cutoff_frequency': 0.01,
                  'operator': 'and'
                }
              }
            }
          }
        }
      ],
      'should': [
        {
          'function_score': {
            'query': {
              'match_all': {

              }
            },
            'max_boost': 20,
            'functions': [
              {
                'field_value_factor': {
                  'modifier': 'log1p',
                  'field': 'popularity',
                  'missing': 1
                },
                'weight': 1
              }
            ],
            'score_mode': 'first',
            'boost_mode': 'replace'
          }
        },
        {
          'function_score': {
            'query': {
              'match_all': {

              }
            },
            'max_boost': 20,
            'functions': [
              {
                'field_value_factor': {
                  'modifier': 'log1p',
                  'field': 'population',
                  'missing': 1
                },
                'weight': 3
              }
            ],
            'score_mode': 'first',
            'boost_mode': 'replace'
          }
        }
      ],
      'filter': [
        {
          'geo_distance': {
            'distance': '20km',
            'distance_type': 'plane',
            'optimize_bbox': 'indexed',
            'center_point': {
              'lat': 37.83239,
              'lon': -122.35698
            }
          }
        }
      ]
    }
  },
  'size': 20,
  'track_scores': true,
  'sort': [
    '_score'
  ]
};
