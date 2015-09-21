
module.exports = {
  'query': {
    'filtered': {
      'query': {
        'bool': {
          'must': [{
            'match': {
              'name.default': {
                'query': 'test',
                'boost': 1,
                'analyzer': 'peliasOneEdgeGram'
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
          }, {
            'function_score': {
              'query': {
                'match': {
                  'phrase.default': {
                    'analyzer': 'peliasPhrase',
                    'type': 'phrase',
                    'boost': 1,
                    'slop': 2,
                    'query': 'test'
                  }
                }
              },
              'functions': [{
                'linear': {
                  'center_point': {
                    'origin': {
                      'lat': 0,
                      'lon': 0
                    },
                    'offset': '1km',
                    'scale': '100km',
                    'decay': 0.5
                  }
                }
              }],
              'score_mode': 'avg',
              'boost_mode': 'replace'
            }
          }]
        }
      }
    }
  },
  'sort': [ '_score' ],
  'size': 10,
  'track_scores': true
};
