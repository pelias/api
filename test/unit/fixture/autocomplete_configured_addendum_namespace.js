module.exports = {
  'query': {
    'bool': {
      'must': [
        {
        'constant_score': {
          'filter': {
            'multi_match': {
              'fields': ['name.default', 'name.en'],
              'analyzer': 'peliasQuery',
              'query': 'something',
              'boost': 100,
              'type': 'phrase',
              'slop': 3
            }
          }
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
      'filter': [
        {
          'terms': {
            'addendum.tariff_zone_ids': [
              'TAR-123', 'TAR-345'
            ]
          }
        }
      ]
    }
  },
  'sort': ['_score'],
  'size': 20,
  'track_scores': true
};
