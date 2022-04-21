module.exports = {
  'query': {
    'bool': {
      'must': [{
        'multi_match': {
          'query': 'test',
          'minimum_should_match': '1<-1 3<-25%',
          'analyzer': 'peliasQuery',
          'fields': [
            'phrase.default',
            'phrase.default_*'
          ]
        }
      }],
      'should': [{
        'multi_match': {
          'query': 'test',
          'type': 'phrase',
          'analyzer': 'peliasPhrase',
          'fields': [
            'phrase.default',
            'phrase.default_*'
          ],
          'slop': 2,
          'boost': 1
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
      }],
      'filter': [
        {
          'terms': {
            'layer': [
              'test'
            ]
          }
        }
      ]
    }
  },
  'sort': [ '_score' ],
  'size': 10,
  'track_scores': true
};
