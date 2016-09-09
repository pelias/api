module.exports = {
  'query': {
    'function_score': {
      'query': {
        'filtered': {
          'query': {
            'bool': {
              'should': []
            }
          },
          'filter': {
            'bool': {
              'must': [
                {
                  'terms': {
                    'layer': [
                      'test'
                    ]
                  }
                }
              ]
            }
          }
        }
      },
      'max_boost': 20,
      'functions': [
        {
          'weight': 2,
          'linear': {
            'center_point': {
              'origin': {
                'lat': 0,
                'lon': 0
              },
              'offset': '0km',
              'scale': '50km',
              'decay': 0.5
            }
          }
        },
        {
          'field_value_factor': {
            'modifier': 'log1p',
            'field': 'popularity',
            'missing': 1
          },
          'weight': 1
        },
        {
          'field_value_factor': {
            'modifier': 'log1p',
            'field': 'population',
            'missing': 1
          },
          'weight': 2
        }
      ],
      'score_mode': 'avg',
      'boost_mode': 'multiply'
    }
  },
  'size': 10,
  'track_scores': true,
  'sort': [
    {
      'population': {
        'order': 'desc'
      }
    },
    {
      'popularity': {
        'order': 'desc'
      }
    },
    '_score'
  ]
};
