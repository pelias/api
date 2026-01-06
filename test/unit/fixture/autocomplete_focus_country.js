module.exports = {
  'query': {
    'bool': {
      'must': [
        {
          'constant_score': {
            'filter': {
              'multi_match': {
                'type': 'phrase',
                'query': 'test',
                'fields': ['name.default', 'name.en'],
                'analyzer': 'peliasQuery',
                'boost': 100,
                'slop': 3,
              },
            },
          },
        },
      ],
      'should': [
        {
          'function_score': {
            'query': { 'match_all': {} },
            'max_boost': 20,
            'functions': [
              { 'field_value_factor': { 'modifier': 'log1p', 'field': 'popularity', 'missing': 1 }, 'weight': 1 },
            ],
            'score_mode': 'first',
            'boost_mode': 'replace',
          },
        },
        {
          'function_score': {
            'query': { 'match_all': {} },
            'max_boost': 20,
            'functions': [
              { 'field_value_factor': { 'modifier': 'log1p', 'field': 'population', 'missing': 1 }, 'weight': 3 },
            ],
            'score_mode': 'first',
            'boost_mode': 'replace',
          },
        },
        {
          'multi_match': {
            'type': 'best_fields',
            'query': 'ABC',
            'fields': ['parent.country_a', 'parent.dependency_a'],
            'analyzer': 'standard',
            'boost': 1.5,
          },
        },
      ],
    },
  },
  'size': 20,
  'track_scores': true,
  'sort': ['_score'],
};
