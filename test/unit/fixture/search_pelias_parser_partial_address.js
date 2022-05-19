var vs = require('../../../query/search_defaults');

module.exports = {
  'query': {
    'bool': {
      'must': [{
        'match': {
          'phrase.default': {
            'query': 'soho grand',
            'minimum_should_match': '1<-1 3<-25%',
            'analyzer': 'peliasQuery',
          }
        }
      }],
      'should': [{
        'match_phrase': {
          'phrase.default': {
            'query': 'soho grand',
            'analyzer': 'peliasPhrase',
            'slop': 2,
            'boost': 1
          }
        }
      },{
        'function_score': {
          'query': {
            'match_all': { }
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
            'match_all': { }
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
      }, {
        'multi_match': {
            'type': 'best_fields',
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
  'sort': ['_score', '_id'],
  'track_scores': true
};
