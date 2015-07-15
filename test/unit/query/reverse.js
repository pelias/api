
var generate = require('../../../query/reverse');
var admin_boost = 'admin_boost';
var population = 'population';
var popularity = 'popularity';
var category = 'category';
var category_weights = require('../../../helper/category_weights');
var admin_weights = require('../../../helper/admin_weights');
var weights = require('pelias-suggester-pipeline').weights;

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
      'params': {
        'weights': admin_weights
      },
      'file': 'weights',
      'type': 'number',
      'order': 'desc'
    }
  },
  {
    '_script': {
      'file': popularity,
      'type': 'number',
      'order': 'desc'
    }
  },
  {
    '_script': {
      'file': population,
      'type': 'number',
      'order': 'desc'
    }
  },
  {
    '_script': {
      'params': {
        'category_weights': category_weights
      },
      'file': category,
      'type': 'number',
      'order': 'desc'
    }
  },
  {
    '_script': {
      'params': {
        'weights': weights
      },
      'file': 'weights',
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
      'sort': [
        '_score',
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
      ].concat(sort.slice(1)),
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

  test('valid query with categories', function(t) {
    var params = { lat: 29.49136, lon: -82.50622, categories: ['food', 'education', 'entertainment'] };
    var query = generate(params);

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
                },
                {
                  'terms': {
                    'category': params.categories
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
            'unit': 'km'
          }
        }
      ].concat(sort.slice(1)),
      'size': 1,
      'track_scores': true
    };

    t.deepEqual(query, expected, 'valid reverse query with categories');

    // test different sizes
    var sizes = [1,2,10,undefined,null];
    sizes.forEach( function(size) {
      params.size = size;
      query = generate(params);
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