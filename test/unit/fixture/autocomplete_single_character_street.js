module.exports = {
  'query': {
    'bool': {
      'must': [{
        'match': {
          'name.default': {
            'analyzer': 'peliasQueryFullToken',
            'cutoff_frequency': 0.01,
            'type': 'phrase',
            'boost': 1,
            'slop': 3,
            'query': 'k road'
          }
        }
      }],
      'should':[
        {
          'match': {
            'address_parts.street': {
              'query': 'k road',
              'cutoff_frequency': 0.01,
              'boost': 5,
              'analyzer': 'peliasStreet'
            }
          }
        },
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
            'query': 'laird',
            'analyzer': 'peliasAdmin',
            'type': 'cross_fields',
            'cutoff_frequency': 0.01
          }
        },
        {
          'match': {
            'phrase.default': {
              'analyzer' : 'peliasPhrase',
              'type' : 'phrase',
              'boost' : 1,
              'slop' : 3,
              'cutoff_frequency': 0.01,
              'query' : 'k road'
            }
          }
        },
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
