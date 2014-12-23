
var generate = require('../../../query/search');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof generate, 'function', 'valid function');
    t.end();
  });
};

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
      // bbox: { //TODO write a test where no bbox is provided
      //   bottom_left: {
      //     lat: 11.51053655297385,
      //     lon: -103.16362455862279
      //   },
      //   top_right: {
      //     lat: 47.472183447026154,
      //     lon: -61.84881544137721
      //   }
      // },
      layers: ['test']
    });

    var expected = {
      'query': {
        'filtered': {
          'query': {
            'query_string': {
              'query': 'test',
              'fields': [
                'name.default'
              ],
              'default_operator': 'OR'
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
                    '_cache': true
                  }
                }
              ]
            }
          }
        }
      },
      'sort': [],
      'size': 10
    };
    console.log(JSON.stringify(query, 2, null));
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