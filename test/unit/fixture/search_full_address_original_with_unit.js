var vs = require('../../../query/search_defaults');

module.exports = {
  'query': {
    'bool': {
      'must': [
        {
          'match': {
            'name.default': {
              'analyzer': 'peliasQueryFullToken',
              'boost': 1,
              'query': '431 St Kilda Rd'
            }
          }
        }
      ],
      'should': [
        {
          'match': {
            'phrase.default': {
              'analyzer': 'peliasPhrase',
              'type': 'phrase',
              'boost': 1,
              'slop': 2,
              'query': '431 St Kilda Rd'
            }
          }
        },
        {
          'function_score': {
            'query': {
              'match': {
                'phrase.default': {
                  'analyzer': 'peliasPhrase',
                  'type': 'phrase',
                  'boost': 1,
                  'slop': 2,
                  'query': '431 St Kilda Rd'
                }
              }
            },
            'max_boost': 20,
            'functions': [
              {
                'field_value_factor': {
                  'modifier': 'log1p',
                  'field': 'popularity',
                  'missing': 1
                },
                'weight': 1
              }
            ],
            'score_mode': 'first',
            'boost_mode': 'replace'
          }
        },
        {
          'function_score': {
            'query': {
              'match': {
                'phrase.default': {
                  'analyzer': 'peliasPhrase',
                  'type': 'phrase',
                  'boost': 1,
                  'slop': 2,
                  'query': '431 St Kilda Rd'
                }
              }
            },
            'max_boost': 20,
            'functions': [
              {
                'field_value_factor': {
                  'modifier': 'log1p',
                  'field': 'population',
                  'missing': 1
                },
                'weight': 2
              }
            ],
            'score_mode': 'first',
            'boost_mode': 'replace'
          }
        },
        {
          'match': {
            'address_parts.unit': {
              'analyzer': vs['address:unit:analyzer'],
              'boost': vs['address:unit:boost'],
              'query': '8'
            }
          }
        },
        {
          'match': {
            'address_parts.number': {
              'analyzer': vs['address:housenumber:analyzer'],
              'boost': vs['address:housenumber:boost'],
              'query': '431'
            }
          }
        },
        {
          'match': {
            'address_parts.street': {
              'analyzer': vs['address:street:analyzer'],
              'boost': vs['address:street:boost'],
              'query': 'St Kilda Rd'
            }
          }
        },
        {
          'match': {
            'parent.region_a': {
              'analyzer': vs['admin:region_a:analyzer'],
              'boost': vs['admin:region_a:boost'],
              'query': 'Melbourne'
            }
          }
        },
        {
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
            'query': 'Melbourne',
            'analyzer': 'peliasAdmin'
          }
        }
      ],
      'filter': [
        {
          'terms': {
            'layer': [
              'address',
              'venue',
              'country',
              'region',
              'county',
              'neighbourhood',
              'locality',
              'localadmin'
            ]
          }
        }
      ]
    }
  },
  'size': 10,
  'track_scores': true,
  'sort': [
    '_score'
  ]
};
