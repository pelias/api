
var generate = require('../../../query/reverse');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof generate, 'function', 'valid function');
    t.end();
  });
};

var sort = [
  '_score',
  {
    '_script': {
      'script': 'if (doc.containsKey(\'population\')) { return doc[\'population\'].value } else { return 0 }',
      'type': 'number',
      'order': 'desc'
    }
  },
  {
    '_script': {
      'params': {
        'weights': {
          'geoname': 0,
          'address': 4,
          'osmnode': 6,
          'osmway': 6,
          'poi-address': 8,
          'neighborhood': 10,
          'local_admin': 12,
          'locality': 12,
          'admin2': 12,
          'admin1': 14,
          'admin0': 2
        }
      },
      'script': 'if (doc.containsKey(\'_type\')) { '+
                'type=doc[\'_type\'].value; '+
                'return ( type in weights ) ? weights[ type ] : 0 }'+
                'else { return 0 }',
      'type': 'number',
      'order': 'desc'
    }
  }
];

module.exports.tests.query = function(test, common) {
  test('valid query', function(t) {
    var query = generate({
      lat: 29.49136, lon: -82.50622
    });
    
    var expected = {
      'query': {
        'filtered': {
          'query': {
            'match_all': {}
          },
          'filter': {
            'bool': {
              'must': [
                {
                  'geo_distance': {
                    'distance': '50km',
                    'distance_type': 'plane',
                    'optimize_bbox': 'indexed',
                    '_cache': true,
                    'center_point': {
                      'lat': '29.49',
                      'lon': '-82.51'
                    }
                  }
                }
              ]
            }
          }
        }
      },
      'sort': sort.concat([
        {
          '_geo_distance': {
            'center_point': {
              'lat': 29.49136,
              'lon': -82.50622
            },
            'order': 'asc',
            'unit': 'km'
          }
        }
      ]),
      'size': 1,
      'track_scores': true
    };

    t.deepEqual(query, expected, 'valid reverse query');

    // test different sizes
    var sizes = [1,2,10,undefined,null];
    sizes.forEach( function(size) {
      query = generate({
        lat: 29.49136, lon: -82.50622, size: size
      });
      expected.size = size ? size : 1;
      t.deepEqual(query, expected, 'valid reverse query for size: '+ size);      
    });
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('reverse query ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};