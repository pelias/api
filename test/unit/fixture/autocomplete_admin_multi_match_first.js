module.exports = {
  'query': {
    'bool': {
      'must': [{
          'multi_match': {
            'analyzer': 'peliasQuery',
            'boost': 1,
            'fields': [
              'phrase.default',
              'phrase.de'
            ],
            'query': 'Am Großhausberg',
            'slop': 3,
            'type': 'phrase'
          }
        },
        {
          'multi_match': {
            'analyzer': 'peliasAdmin',
            'fields': [
              'parent.country^1',
              'parent.dependency^1',
              'parent.macroregion^1',
              'parent.region^1',
              'parent.county^1',
              'parent.localadmin^1',
              'parent.locality^1',
              'parent.borough^1',
              'parent.neighbourhood^1',
              'parent.locality_a^1',
              'parent.region_a^1',
              'parent.country_a^1',
              'phrase.default^1.5',
              'phrase.de^1.5'
            ],
            'query': 'Furtwangen im Schwarzwald',
            'type': 'cross_fields'
          }
        },
        {
          'multi_match': {
            'analyzer': 'peliasAdmin',
            'fields': [
              'parent.country.ngram^1',
              'parent.dependency.ngram^1',
              'parent.macroregion.ngram^1',
              'parent.region.ngram^1',
              'parent.county.ngram^1',
              'parent.localadmin.ngram^1',
              'parent.locality.ngram^1',
              'parent.borough.ngram^1',
              'parent.neighbourhood.ngram^1',
              'parent.locality_a.ngram^1',
              'parent.region_a.ngram^1',
              'parent.country_a.ngram^1',
              'name.default^1.5',
              'name.de^1.5'
            ],
            'query': 'deut',
            'type': 'cross_fields'
          }
        }
      ],
      'should': [{
          'function_score': {
            'boost_mode': 'replace',
            'functions': [{
              'field_value_factor': {
                'field': 'popularity',
                'missing': 1,
                'modifier': 'log1p'
              },
              'weight': 1
            }],
            'max_boost': 20,
            'query': {
              'match_all': {}
            },
            'score_mode': 'first'
          }
        },
        {
          'function_score': {
            'boost_mode': 'replace',
            'functions': [{
              'field_value_factor': {
                'field': 'population',
                'missing': 1,
                'modifier': 'log1p'
              },
              'weight': 3
            }],
            'max_boost': 20,
            'query': {
              'match_all': {}
            },
            'score_mode': 'first'
          }
        }
      ]
    }
  },
  'size': 20,
  'sort': [
    '_score'
  ],
  'track_scores': true
};