
var vs = require('../../../query/search_defaults');

module.exports = {
  'query': {
    'filtered': {
      'query': {
        'bool': {
          'must': [{
            'match': {
              'name.default': {
                'query': '1 water st',
                'analyzer': 'peliasOneEdgeGram',
                'boost': 1
              }
            }
          }],
          'should': [{
            'match': {
              'phrase.default': {
                'query': '1 water st',
                'analyzer': 'peliasPhrase',
                'type': 'phrase',
                'slop': 2,
                'boost': 1
              }
            }
          },{
            'function_score': {
              'query': {
                'match': {
                  'phrase.default': {
                    'query': '1 water st',
                    'analyzer': 'peliasPhrase',
                    'type': 'phrase',
                    'slop': 2,
                    'boost': 1
                  }
                }
              },
              'max_boost': 20,
              'score_mode': 'first',
              'boost_mode': 'replace',
              'filter': {
                'exists': {
                  'field': 'popularity'
                }
              },
              'functions': [{
                'field_value_factor': {
                  'modifier': 'log1p',
                  'field': 'popularity'
                },
                'weight': 1
              }]
            }
          },{
            'function_score': {
              'query': {
                'match': {
                  'phrase.default': {
                    'query': '1 water st',
                    'analyzer': 'peliasPhrase',
                    'type': 'phrase',
                    'slop': 2,
                    'boost': 1
                  }
                }
              },
              'max_boost': 20,
              'score_mode': 'first',
              'boost_mode': 'replace',
              'filter': {
                'exists': {
                  'field': 'population'
                }
              },
              'functions': [{
                'field_value_factor': {
                  'modifier': 'log1p',
                  'field': 'population'
                },
                'weight': 2
              }]
            }
          },{
            'match': {
              'address.number': {
                'query': '1',
                'boost': vs['address:housenumber:boost'],
                'analyzer': vs['address:housenumber:analyzer']
              }
            }
          }, {
            'match': {
              'address.street': {
                'query': 'water st',
                'boost': vs['address:street:boost'],
                'analyzer': vs['address:street:analyzer']
              }
            }
          }, {
            'match': {
              'admin0': {
                'query': 'manhattan',
                'boost': vs['admin:admin0:boost'],
                'analyzer': vs['admin:admin0:analyzer']
              }
            }
          }, {
            'match': {
              'admin1': {
                'query': 'manhattan',
                'boost': vs['admin:admin1:boost'],
                'analyzer': vs['admin:admin1:analyzer']
              }
            }
          }, {
            'match': {
              'admin1_abbr': {
                'query': 'NY',
                'boost': vs['admin:admin1_abbr:boost'],
                'analyzer': vs['admin:admin1_abbr:analyzer']
              }
            }
          }, {
            'match': {
              'admin2': {
                'query': 'manhattan',
                'boost': vs['admin:admin2:boost'],
                'analyzer': vs['admin:admin2:analyzer']
              }
            }
          }, {
            'match': {
              'local_admin': {
                'query': 'manhattan',
                'boost': vs['admin:local_admin:boost'],
                'analyzer': vs['admin:local_admin:analyzer']
              }
            }
          }, {
            'match': {
              'locality': {
                'query': 'manhattan',
                'boost': vs['admin:locality:boost'],
                'analyzer': vs['admin:locality:analyzer']
              }
            }
          }, {
            'match': {
              'neighborhood': {
                'query': 'manhattan',
                'boost': vs['admin:neighborhood:boost'],
                'analyzer': vs['admin:neighborhood:analyzer']
              }
            }
          }]
        }
      }
    }
  },
  'size': 10,
  'sort': [ '_score' ],
  'track_scores': true
};
