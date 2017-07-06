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
                      'address_parts.street': 'street value'
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
                  'terms': {
                    'source': [
                      'test_source'
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
  'size': 20,
  'track_scores': true,
  'sort': [
    '_score'
  ]
};
