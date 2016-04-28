
var vs = require('../../../query/search_defaults');

module.exports = {
  'query': {
    'filtered': {
      'query': {
        'bool': {
          'must': [{
            'match': {
              'phrase.default': {
                'query': '1 water st',
                'analyzer': 'peliasPhrase',
                'type': 'phrase',
                'slop': 2,
                'boost': 1
              }
            }
          }],
          'should': [{
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
                'query': '1',
                'boost': vs['address:housenumber:boost'],
                'analyzer': vs['address:housenumber:analyzer']
              }
            }
          }, {
            'match': {
              'address_parts.street': {
                'query': 'water st',
                'boost': vs['address:street:boost'],
                'analyzer': vs['address:street:analyzer']
              }
            }
          }, {
            'match': {
              'parent.country': {
                'query': 'manhattan',
                'boost': vs['admin:country:boost'],
                'analyzer': vs['admin:country:analyzer']
              }
            }
          }, {
            'match': {
              'parent.region': {
                'query': 'manhattan',
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
                'query': 'manhattan',
                'boost': vs['admin:county:boost'],
                'analyzer': vs['admin:county:analyzer']
              }
            }
          }, {
            'match': {
              'parent.borough': {
                'query': 'manhattan',
                'boost': vs['admin:borough:boost'],
                'analyzer': vs['admin:borough:analyzer']
              }
            }
          }, {
            'match': {
              'parent.localadmin': {
                'query': 'manhattan',
                'boost': vs['admin:localadmin:boost'],
                'analyzer': vs['admin:localadmin:analyzer']
              }
            }
          }, {
            'match': {
              'parent.locality': {
                'query': 'manhattan',
                'boost': vs['admin:locality:boost'],
                'analyzer': vs['admin:locality:analyzer']
              }
            }
          }, {
            'match': {
              'parent.neighbourhood': {
                'query': 'manhattan',
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
