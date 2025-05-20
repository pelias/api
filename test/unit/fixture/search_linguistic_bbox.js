module.exports = {
  'query': {
    'function_score': {
      'query': {
        'bool': {
          'minimum_should_match': 1,
          'should': [
            {
              'bool': {
                '_name': 'fallback.street',
                'boost': 5,
                'must': [
                  {
                    'match_phrase': {
                      'address_parts.street': {
                        'query': 'street value',
                        'analyzer': 'peliasQuery',
                        'slop': 4
                      }
                    }
                  }
                ],
                'should': [],
                'filter': {
                  'term': {
                    'layer': 'street'
                  }
                }
              }
            }
          ],
          'filter': {
            'bool': {
              'must': [
                {
                  'geo_bounding_box': {
                    'center_point': {
                      'top': 11.51,
                      'right': -61.84,
                      'bottom': 47.47,
                      'left': -103.16
                    }
                  }
                },
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
    '_score'
  ]
};
