module.exports = {
  'query': {
    'bool': {
      'must': [{
        'match_phrase': {
          'phrase.default': {
            'analyzer': 'peliasQuery',
            'boost': 1,
            'slop': 3,
            'query': 'one two'
          }
        }
      },
      {
        'constant_score': {
          'filter': {
            'multi_match': {
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
                'name.default^1.5'
              ],
              'query': 'three',
              'analyzer': 'peliasQuery',
              'type': 'cross_fields'
            }
          }
        }
      }],
      'should':[
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
      },{
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
      }]
    }
  },
  'sort': [ '_score' ],
  'size': 20,
  'track_scores': true
};
