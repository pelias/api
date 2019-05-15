module.exports = {
  'query': {
    'bool': {
      'must': [
        {
          'match': {
            'name.default': {
              'analyzer': 'peliasQueryFullToken',
              'type': 'phrase',
              'boost': 1,
              'slop': 3,
              'cutoff_frequency': 0.01,
              'query': 'one two'
            }
          }
        }
      ],
      'should': [
        {
          'multi_match': {
            'fields': [
              'parent.country.ngram^800',
              'parent.region.ngram^600',
              'parent.county.ngram^400',
              'parent.localadmin.ngram^200',
              'parent.locality.ngram^200',
              'parent.borough.ngram^600',
              'parent.neighbourhood.ngram^200',
              'parent.region_a.ngram^600'
            ],
            'query': 'three',
            'analyzer': 'peliasAdmin',
            'type': 'cross_fields',
            'cutoff_frequency': 0.01
          }
        },
        {
          'match': {
            'phrase.default': {
              'analyzer' : 'peliasPhrase',
              'cutoff_frequency': 0.01,
              'type' : 'phrase',
              'boost' : 1,
              'slop' : 3,
              'query' : 'one two'
            }
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
