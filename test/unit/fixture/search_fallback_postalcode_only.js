module.exports = {
  'query': {
    'function_score': {
      'query': {
        'filtered': {
          'query': {
            'bool': {
              'should': [
                {
                  'bool': {
                    '_name': 'fallback.postalcode',
                    'must': [
                      {
                        'multi_match': {
                          'query': '90210',
                          'type': 'phrase',
                          'fields': [
                            'parent.postalcode'
                          ]
                        }
                      }
                    ],
                    'filter': {
                      'term': {
                        'layer': 'postalcode'
                      }
                    }
                  }
                }
              ]
            }
          },
          'filter': {
            'bool': {
              'must': []
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
  'size': 20,
  'track_scores': true,
  'sort': [
    '_score'
  ]
};
