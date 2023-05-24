module.exports = {
  'query': {
    'bool': {
      'must': [{
        'multi_match': {
          'fields': ['phrase.default', 'phrase.en'],
          'analyzer': 'peliasQuery',
          'type': 'phrase',
          'slop': 3,
          'boost': 1,
          'query': '1 2'
        }
      },
      {
        'multi_match': {
          'fields': ['name.default', 'name.en'],
          'analyzer': 'peliasQuery',
          'query': 'three',
          'boost': 1,
          'type': 'phrase',
          'slop': 3
        }
      }],
      'should': [
        {
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
        }, {
          'function_score': {
            'max_boost': 20,
            'score_mode': 'first',
            'boost_mode': 'replace',
            'functions': [{
              'field_value_factor': {
                'modifier': 'none',
                'field': 'population',
                'missing': 1,
                'factor': 0.0002
              },
              'weight': 3
            }]
          }
        }]
    }
  },
  'sort': ['_score'],
  'size': 20,
  'track_scores': true
};
