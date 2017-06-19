var vs = require('../../../query/reverse_defaults');

module.exports = {
  'query': {
    'bool': {
      'must': [
        {
          'match': {
            'parent.country_a': {
              'analyzer': 'standard',
              'query': 'ABC'
            }
          }
        }
      ],
      'filter': [{
        'geo_distance': {
          'distance': '3km',
          'distance_type': 'plane',
          'optimize_bbox': 'indexed',
          'center_point': {
            'lat': 29.49136,
            'lon': -82.50622
          }
        }
      },
      {
        'terms': {
          'layer': ['venue', 'address', 'street']
        }
      }]
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
