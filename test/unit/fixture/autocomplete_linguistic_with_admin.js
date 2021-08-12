module.exports = {
  'query': {
    'bool': {
      'must': [
        {
          'multi_match': {
            'fields': ['phrase.default', 'phrase.en'],
            'analyzer': 'peliasQuery',
            'type': 'phrase',
            'slop': 3,
            'boost': 1,
            'query': 'one two'
          }
        },
        {
          'multi_match': {
            'fields': [
              'parent.country.ngram^1',
              'parent.dependency.ngram^1',
              'parent.macroregion.ngram^1',
              'parent.region.ngram^1',
              'parent.macrocounty.ngram^1',
              'parent.county.ngram^1',
              'parent.localadmin.ngram^1',
              'parent.locality.ngram^1',
              'parent.borough.ngram^1',
              'parent.neighbourhood.ngram^1',
              'parent.locality_a.ngram^1',
              'parent.region_a.ngram^1',
              'parent.country_a.ngram^1',
              'name.default^1.5',
              'name.en^1.5'
            ],
            'query': 'three',
            'analyzer': 'peliasAdmin',
            'type': 'cross_fields'
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
            'query': {
              'match_all': {}
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
      ]
    }
  },
  'size': 20,
  'track_scores': true,
  'sort': [
    '_score'
  ]
};
