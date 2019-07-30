module.exports = {
  'query': {
    'bool': {
      'must': [{
        'match': {
          'name.default': {
            'analyzer': 'peliasQuery',
            'type': 'phrase',
            'boost': 1,
            'slop': 3,
            'cutoff_frequency': 0.01,
            'query': 'one two'
          }
        }
      },
      {
        'constant_score': {
          'query': {
            'match': {
              'name.default': {
                'analyzer': 'peliasQuery',
                'boost': 100,
                'query': 'three',
                'type': 'phrase',
                'operator': 'and',
                'cutoff_frequency': 0.01,
                'slop': 3
              }
            }
          }
        }
      }],
      'should':[
        {
          'match': {
            'phrase.default': {
              'analyzer' : 'peliasPhrase',
              'type' : 'phrase',
              'boost' : 1,
              'slop' : 3,
              'cutoff_frequency': 0.01,
              'query' : 'one two'
            }
          }
        },
        {
        'function_score': {
          'query': {
            'match_all': {}
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
            'match_all': {}
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
            'weight': 3
          }]
        }
      }]
    }
  },
  'sort': [ '_score' ],
  'size': 20,
  'track_scores': true
};
