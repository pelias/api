
var generate = require('../../../query/search');
var admin_boost = 'admin_boost';
var population = 'population';
var popularity = 'popularity';
var category = 'category';
var category_weights = require('../../../helper/category_weights');
var weights = require('pelias-suggester-pipeline').weights;

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof generate, 'function', 'valid function');
    t.end();
  });
};

function createExpectedQuery(){
  var sort = [
    '_score',
    {
      '_script': {
        'file': admin_boost,
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
        'file': popularity,
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
    },
    {
      '_script': {
        'params': {
          'input': 'test'
        },
        'file': 'exact_match',
        'type': 'number',
        'order': 'desc'
      }
    }
  ];

  return {
    'query': {
      'filtered': {
        'query': {
          'bool': {
            'must': [{ 
                'match': {
                  'name.default': 'test'
                }
              }
            ]   
          }
        },
        'filter': {
          'bool': {
            'must': [
              {
                'geo_bounding_box': {
                  'center_point': {
                    'top': '47.47',
                    'right': '-61.84',
                    'bottom':'11.51',
                    'left': '-103.16'
                  },
                  '_cache': true,
                  'type': 'indexed'
                }
              }
            ]
          }
        }
      }
    },
    'sort': sort,
    'size': 10,
    'track_scores': true
  };
}

module.exports.tests.query = function(test, common) {
  test('valid query', function(t) {
    var query = generate({
      input: 'test', size: 10,
      lat: 29.49136, lon: -82.50622,
      bbox: {
        top: 47.47, 
        right: -61.84, 
        bottom: 11.51, 
        left: -103.16
      },
      layers: ['test']
    });

    t.deepEqual(query, createExpectedQuery(), 'valid search query');
    t.end();
  });

  test('valid query without lat/lon', function(t) {
    var query = generate({
      input: 'test', size: 10,
      bbox: {
        top: 47.47, 
        right: -61.84, 
        bottom: 11.51, 
        left: -103.16
      },
      layers: ['test']
    });
    
    t.deepEqual(query, createExpectedQuery(), 'valid search query');
    t.end();
  });

  test('valid query with no lat/lon and no bbox', function(t) {
    var query = generate({
      input: 'test', size: 10,
      layers: ['test']
    });

    var expected = createExpectedQuery();
    expected.query.filtered.filter.bool.must = [];
    t.deepEqual(query, expected, 'valid search query');
    t.end();
  });

  test('valid query without bbox', function(t) {
    var query = generate({
      input: 'test', size: 10,
      lat: 29.49136, lon: -82.50622,
      layers: ['test']
    });

    var expected = createExpectedQuery();
    expected.query.filtered.filter.bool.must = [{
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
    }];
    expected.sort.shift();
    expected.sort.unshift(
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
    );

    t.deepEqual(query, expected, 'valid search query');
    t.end();
  });

  test('valid query with categories', function(t) {
    var query = generate({
      input: 'test',
      size: 10,
      lat: 29.49136,
      lon: -82.50622,
      bbox: {
        top: 47.47,
        right: -61.84,
        bottom: 11.51,
        left: -103.16
      },
      layers: ['test'],
      categories: ['narwhal', 'foobar']
    });

    var expected = createExpectedQuery();
    expected.query.filtered.filter.bool.must.push({
      terms: {
        category: ['narwhal', 'foobar']
      }
    });
    t.deepEqual(query, expected, 'valid search query');
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('search query ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
