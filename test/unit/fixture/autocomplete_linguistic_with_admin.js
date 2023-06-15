module.exports = {
  'query': {
    'bool': {
      'must': [
        {
          'multi_match': {
            'fields': ['name.default', 'name.en'],
            'analyzer': 'peliasQuery',
            'type': 'best_fields',
            'fuzziness': 'AUTO',
            'minimum_should_match': '2<90%',
            'boost': 1,
            'query': 'one two three',
            'prefix_length': 0,
            'max_expansions': 50,
            'zero_terms_query': 'NONE'
          }
        }
      ],
      'should': [
        {
          'function_score': {
            'query': {
              'match_all': {}
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
            'max_boost': 20,
            'functions': [
              {
                'field_value_factor': {
                  'modifier': 'none',
                  'field': 'population',
                  'missing': 1,
                  'factor': 0.0002
                },
                'weight': 3
              }
            ],
            'score_mode': 'first',
            'boost_mode': 'replace'
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
