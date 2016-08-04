var vs = require('../../../query/reverse_defaults');

module.exports = {
  'query': {
    'filtered': {
      'query': {
        'bool': {}
      },
      'filter': {
        'bool': {
          'must': [
            {
              'geo_distance': {
                'distance': vs.distance,
                'distance_type': 'plane',
                'optimize_bbox': 'indexed',
                'center_point': {
                  'lat': 29.49136,
                  'lon': -82.50622
                }
              }
            }
          ]
        }
      }
    }
  },
  'sort': [
    '_score',
    {
      '_geo_distance': {
        'center_point': {
          'lat': 29.49136,
          'lon': -82.50622
        },
        'order': 'asc',
        'distance_type': 'plane'
      }
    }
  ],
  'size': vs.size,
  'track_scores': true
};
