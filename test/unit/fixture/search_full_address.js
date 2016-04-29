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
                'analyzer': 'peliasIndexOneEdgeGram',
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
              'functions': [{
                'field_value_factor': {
                  'modifier': 'log1p',
                  'field': 'population',
                  'missing': 1
                },
                'weight': 2
              }]
            }
          },{
            'match': {
              'address_parts.number': {
                'query': '123',
                'boost': vs['address:housenumber:boost'],
                'analyzer': vs['address:housenumber:analyzer']
              }
            }
          }, {
            'match': {
              'address_parts.street': {
                'query': 'main st',
                'boost': vs['address:street:boost'],
                'analyzer': vs['address:street:analyzer']
              }
            }
          }, {
            'match': {
              'address_parts.zip': {
                'query': '10010',
                'boost': vs['address:postcode:boost'],
                'analyzer': vs['address:postcode:analyzer']
              }
            }
          }, {
            'match': {
              'parent.country': {
                'query': 'new york',
                'boost': vs['admin:country:boost'],
                'analyzer': vs['admin:country:analyzer']
              }
            }
          }, {
            'match': {
              'parent.country_a': {
                'query': 'USA',
                'boost': vs['admin:country_a:boost'],
                'analyzer': vs['admin:country_a:analyzer']
              }
            }
          }, {
            'match': {
              'parent.region': {
                'query': 'new york',
                'boost': vs['admin:region:boost'],
                'analyzer': vs['admin:region:analyzer']
              }
            }
          }, {
            'match': {
              'parent.region_a': {
                'query': 'NY',
                'boost': vs['admin:region_a:boost'],
                'analyzer': vs['admin:region_a:analyzer']
              }
            }
          }, {
            'match': {
              'parent.county': {
                'query': 'new york',
                'boost': vs['admin:county:boost'],
                'analyzer': vs['admin:county:analyzer']
              }
            }
          }, {
            'match': {
              'parent.borough': {
                'query': 'new york',
                'boost': vs['admin:borough:boost'],
                'analyzer': vs['admin:borough:analyzer']
              }
            }
          }, {
            'match': {
              'parent.localadmin': {
                'query': 'new york',
                'boost': vs['admin:localadmin:boost'],
                'analyzer': vs['admin:localadmin:analyzer']
              }
            }
          }, {
            'match': {
              'parent.locality': {
                'query': 'new york',
                'boost': vs['admin:locality:boost'],
                'analyzer': vs['admin:locality:analyzer']
              }
            }
          }, {
            'match': {
              'parent.neighbourhood': {
                'query': 'new york',
                'boost': vs['admin:neighbourhood:boost'],
                'analyzer': vs['admin:neighbourhood:analyzer']
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
