
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
          }]
        }
      },
      'filter': {
        'bool': {
          'must': [{
            'geo_bounding_box': {
              'center_point': {
                'top': 47.47,
                'right': -61.84,
                'bottom': 11.51,
                'left': -103.16
              },
              '_cache': true,
              'type': 'indexed'
            }
          }]
        }
      }
    }
  },
  'sort': [ '_sort' ],
  'size': 10,
  'track_scores': true
};