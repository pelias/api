var vs = require('../../../query/search_defaults');

module.exports = {
  'query': {
    'filtered': {
      'query': {
        'bool': {
          'must': [{
            'multi_match': {
              'query': '123 main st',
              'analyzer': 'peliasIndexOneEdgeGram',
              'boost': 1,
	      'fields': ['name.*']
            }
          }],
          'should': [{
            'multi_match': {
	      'query': '123 main st',
              'analyzer': 'peliasPhrase',
              'type': 'phrase',
              'slop': 2,
              'boost': 1,
	      'fields': ['name.*']
            }
          },
          {
            'function_score': {
              'query': {
                'multi_match': {
                  'query': '123 main st',
                  'analyzer': 'peliasPhrase',
                  'type': 'phrase',
                  'slop': 2,
                  'boost': 1,
		  'fields': ['name.*']
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
                'multi_match': {
                  'query': '123 main st',
                  'analyzer': 'peliasPhrase',
                  'type': 'phrase',
                  'slop': 2,
                  'boost': 1,
		  'fields': ['name.*']
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
              'parent.country_a': {
                'query': 'USA',
                'boost': vs['admin:country_a:boost'],
                'analyzer': vs['admin:country_a:analyzer']
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
            'multi_match': {
                'fields': [
                  'parent.country^1',
                  'parent.region^1',
                  'parent.county^1',
                  'parent.localadmin^1',
                  'parent.locality^1',
                  'parent.borough^1',
                  'parent.neighbourhood^1',
                  'parent.region_a^1'
                ],
                'query': 'new york',
                'analyzer': 'peliasAdmin'
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
