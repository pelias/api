
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
                'query': 'soho grand',
                'analyzer': 'peliasOneEdgeGram',
                'boost': 1
              }
            }
          }],
          'should': [{
            'match': {
              'phrase.default': {
                'query': 'soho grand',
                'analyzer': 'peliasPhrase',
                'type': 'phrase',
                'slop': 2,
                'boost': 1
              }
            }
          },{
            'match': {
              'admin0': {
                'query': 'new york',
                'boost': vs.var('admin:admin0:boost').get(),
                'analyzer': vs.var('admin:admin0:analyzer').get()
              }
            }
          }, {
            'match': {
              'admin1': {
                'query': 'new york',
                'boost': vs.var('admin:admin1:boost').get(),
                'analyzer': vs.var('admin:admin1:analyzer').get()
              }
            }
          }, {
            'match': {
              'admin1_abbr': {
                'query': 'new york',
                'boost': vs.var('admin:admin1_abbr:boost').get(),
                'analyzer': vs.var('admin:admin1_abbr:analyzer').get()
              }
            }
          }, {
            'match': {
              'admin2': {
                'query': 'new york',
                'boost': vs.var('admin:admin2:boost').get(),
                'analyzer': vs.var('admin:admin2:analyzer').get()
              }
            }
          }, {
            'match': {
              'local_admin': {
                'query': 'new york',
                'boost': vs.var('admin:local_admin:boost').get(),
                'analyzer': vs.var('admin:local_admin:analyzer').get()
              }
            }
          }, {
            'match': {
              'locality': {
                'query': 'new york',
                'boost': vs.var('admin:locality:boost').get(),
                'analyzer': vs.var('admin:locality:analyzer').get()
              }
            }
          }, {
            'match': {
              'neighborhood': {
                'query': 'new york',
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