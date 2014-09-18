
var generate = require('../../../query/suggest');

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
      lat: 0, lon: 0,
      layers: ['test']
    });
    var expected = {
      pelias: {
        text: 'test',
        completion: {
          field: 'suggest',
          size: 10,
          context: {
            dataset: [ 'test' ],
            location: {
              precision: 2,
              value: [ 0, 0 ]
            }
          }
        }
      }
    };
    t.deepEqual(query, expected, 'valid suggest query');
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('suggest query ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};