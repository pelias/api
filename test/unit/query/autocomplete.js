
var generate = require('../../../query/autocomplete');
var parser = require('../../../helper/query_parser');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof generate, 'function', 'valid function');
    t.end();
  });
};
function foo( a, b ){
  console.log( '----------------' );
  console.log( JSON.stringify( a, null, 2 ) );
  console.log( '----------------' );
  console.log( JSON.stringify( b, null, 2 ) );
  console.log( '----------------' );
}

module.exports.tests.query = function(test, common) {
  test('valid lingustic-only autocomplete', function(t) {
    var query = generate({
      text: 'test'
    });

    var expected = require('../fixture/autocomplete_linguistic_only');

    t.deepEqual(query, expected, 'valid autocomplete query');
    t.end();
  });

  test('autocomplete + focus', function(t) {
    var query = generate({
      text: 'test',
      lat: 29.49136,
      lon: -82.50622
    });

    var expected = require('../fixture/autocomplete_linguistic_focus');

    t.deepEqual(query, expected, 'valid autocomplete query');
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('autocomplete query ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
