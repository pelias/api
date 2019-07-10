module.exports = {
  'query': {
    'bool': {
      'must': [{
        'match': {
          'name.default': {
            'analyzer': 'peliasQuery',
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
        }, {
          'match': {
            'parent.country.ngram': {
              'query': 'laird',
              'cutoff_frequency': 0.01,
              'boost': 800,
              'analyzer': 'peliasAdmin'
            }
          }
        }, {
          'match': {
            'parent.region.ngram': {
              'query': 'laird',
              'cutoff_frequency': 0.01,
              'boost': 600,
              'analyzer': 'peliasAdmin'
            }
          }
        }, {
          'match': {
            'parent.region_a.ngram': {
              'query': 'laird',
              'cutoff_frequency': 0.01,
              'boost': 600,
              'analyzer': 'peliasAdmin'
            }
          }
        }, {
          'match': {
            'parent.county.ngram': {
              'query': 'laird',
              'cutoff_frequency': 0.01,
              'boost': 400,
              'analyzer': 'peliasAdmin'
            }
          }
        }, {
          'match': {
            'parent.borough.ngram': {
              'analyzer': 'peliasAdmin',
              'cutoff_frequency': 0.01,
              'boost': 600,
              'query': 'laird'
            }
          }
        }, {
          'match': {
            'parent.localadmin.ngram': {
              'query': 'laird',
              'cutoff_frequency': 0.01,
              'boost': 200,
              'analyzer': 'peliasAdmin'
            }
          }
        }, {
          'match': {
            'parent.locality.ngram': {
              'query': 'laird',
              'cutoff_frequency': 0.01,
              'boost': 200,
              'analyzer': 'peliasAdmin'
            }
          }
        }, {
          'match': {
            'parent.neighbourhood.ngram': {
              'query': 'laird',
              'cutoff_frequency': 0.01,
              'boost': 200,
              'analyzer': 'peliasAdmin'
            }
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
