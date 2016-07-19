
module.exports = {
  'query': {
    'bool': {
      'must': [{
        'match': {
          'name.default': {
            'query': 'test',
            'boost': 1,
            'analyzer': 'peliasQueryFullToken'
          }
        }
      }],
      'should': [{
        'match': {
          'phrase.default': {
            'query': 'test',
            'analyzer': 'peliasPhrase',
            'type': 'phrase',
            'boost': 1,
            'slop': 2
          }
        }
      },{
        'function_score': {
          'query': {
            'match': {
              'phrase.default': {
                'query': 'test',
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
                'query': 'test',
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
      }],
      'filter': [{
        'geo_bounding_box': {
          'type': 'indexed',
          'center_point': {
            'top': 11.51,
            'right': -61.84,
            'bottom': 47.47,
            'left': -103.16
            }
          }
        },
        {
          'terms': {
            'layer': [
              'test'
            ]
          }
      }]
    }
  },
  'sort': [ '_score' ],
  'size': 10,
  'track_scores': true
};
