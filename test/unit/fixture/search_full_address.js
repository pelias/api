var vs = require('../../../query/search_defaults');

module.exports = {
  'query': {
    'filtered': {
      'query': {
        'bool': {
          'must': [{
            'match': {
              'name.default': {
                'query': '123 main st',
                'analyzer': 'peliasOneEdgeGram',
                'boost': 1
              }
            }
          }],
          'should': [{
            'match': {
              'phrase.default': {
                'query': '123 main st',
                'analyzer': 'peliasPhrase',
                'type': 'phrase',
                'slop': 2,
                'boost': 1
              }
            }
          },
          {
            'function_score': {
              'query': {
                'match': {
                  'phrase.default': {
                    'query': '123 main st',
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
                    'query': '123 main st',
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
                'query': '123',
                'boost': vs['address:housenumber:boost'],
                'analyzer': vs['address:housenumber:analyzer']
              }
            }
          }, {
            'match': {
              'address.street': {
                'query': 'main st',
                'boost': vs['address:street:boost'],
                'analyzer': vs['address:street:analyzer']
              }
            }
          }, {
            'match': {
              'address.zip': {
                'query': '10010',
                'boost': vs['address:postcode:boost'],
                'analyzer': vs['address:postcode:analyzer']
              }
            }
          }, {
            'match': {
              'alpha3': {
                'query': 'USA',
                'boost': vs['admin:alpha3:boost'],
                'analyzer': vs['admin:alpha3:analyzer']
              }
            }
          }, {
            'match': {
              'admin0': {
                'query': 'new york',
                'boost': vs['admin:admin0:boost'],
                'analyzer': vs['admin:admin0:analyzer']
              }
            }
          }, {
            'match': {
              'admin1': {
                'query': 'new york',
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
                'query': 'new york',
                'boost': vs['admin:admin2:boost'],
                'analyzer': vs['admin:admin2:analyzer']
              }
            }
          }, {
            'match': {
              'local_admin': {
                'query': 'new york',
                'boost': vs['admin:local_admin:boost'],
                'analyzer': vs['admin:local_admin:analyzer']
              }
            }
          }, {
            'match': {
              'locality': {
                'query': 'new york',
                'boost': vs['admin:locality:boost'],
                'analyzer': vs['admin:locality:analyzer']
              }
            }
          }, {
            'match': {
              'neighborhood': {
                'query': 'new york',
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
