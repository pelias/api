
var peliasQuery = require('pelias-query'),
    vs = new peliasQuery.Vars( peliasQuery.defaults );

module.exports = {
  'query': {
    'filtered': {
      'query': {
        'bool': {
          'must': [{
            'match': {
              'name.default': {
                'query': 'water st',
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
          },
          {
            'function_score': {
              'query': {
                'filtered': {
                  'filter': {
                    'exists': {
                      'field': 'popularity'
                    }
                  }
                }
              },
              'max_boost': 2,
              'score_mode': 'first',
              'boost_mode': 'replace',
              'filter': {
                'or': [
                  {
                    'type': {
                      'value': 'admin0'
                    }
                  },
                  {
                    'type': {
                      'value': 'admin1'
                    }
                  },
                  {
                    'type': {
                      'value': 'admin2'
                    }
                  }
                ]
              },
              'functions': [{
                'field_value_factor': {
                  'modifier': 'sqrt',
                  'field': 'popularity'
                },
                'weight': 1
              }]
            }
          },{
            'match': {
              'address.number': {
                'query': 1,
                'boost': vs.var('address:housenumber:boost').get(),
                'analyzer': vs.var('address:housenumber:analyzer').get()
              }
            }
          }, {
            'match': {
              'address.street': {
                'query': 'water st',
                'boost': vs.var('address:street:boost').get(),
                'analyzer': vs.var('address:street:analyzer').get()
              }
            }
          }, {
            'match': {
              'admin0': {
                'query': 'manhattan',
                'boost': vs.var('admin:admin0:boost').get(),
                'analyzer': vs.var('admin:admin0:analyzer').get()
              }
            }
          }, {
            'match': {
              'admin1': {
                'query': 'manhattan',
                'boost': vs.var('admin:admin1:boost').get(),
                'analyzer': vs.var('admin:admin1:analyzer').get()
              }
            }
          }, {
            'match': {
              'admin1_abbr': {
                'query': 'NY',
                'boost': vs.var('admin:admin1_abbr:boost').get(),
                'analyzer': vs.var('admin:admin1_abbr:analyzer').get()
              }
            }
          }, {
            'match': {
              'admin2': {
                'query': 'manhattan',
                'boost': vs.var('admin:admin2:boost').get(),
                'analyzer': vs.var('admin:admin2:analyzer').get()
              }
            }
          }, {
            'match': {
              'local_admin': {
                'query': 'manhattan',
                'boost': vs.var('admin:local_admin:boost').get(),
                'analyzer': vs.var('admin:local_admin:analyzer').get()
              }
            }
          }, {
            'match': {
              'locality': {
                'query': 'manhattan',
                'boost': vs.var('admin:locality:boost').get(),
                'analyzer': vs.var('admin:locality:analyzer').get()
              }
            }
          }, {
            'match': {
              'neighborhood': {
                'query': 'manhattan',
                'boost': vs.var('admin:neighborhood:boost').get(),
                'analyzer': vs.var('admin:neighborhood:analyzer').get()
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