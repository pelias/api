var vs = require('../../../query/search_defaults');

module.exports = {
  'query': {
    'bool': {
      'must': [{
        'match': {
          'name.default': {
            'query': '1 water st',
            'cutoff_frequency': 0.01,
            'analyzer': 'peliasQueryFullToken',
            'boost': 1
          }
        }
      }],
      'should': [{
        'match': {
          'phrase.default': {
            'query': '1 water st',
            'cutoff_frequency': 0.01,
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
                'cutoff_frequency': 0.01,
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
                'cutoff_frequency': 0.01,
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
            'cutoff_frequency': 0.01,
            'boost': vs['address:housenumber:boost'],
            'analyzer': vs['address:housenumber:analyzer']
          }
        }
      }, {
        'match': {
          'address_parts.street': {
            'query': 'water st',
            'cutoff_frequency': 0.01,
            'boost': vs['address:street:boost'],
            'analyzer': vs['address:street:analyzer']
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
            'query': 'manhattan ny',
            'analyzer': 'peliasAdmin',
            'cutoff_frequency': 0.01
        }
      }],
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
  'sort': [ '_score' ],
  'track_scores': true
};
