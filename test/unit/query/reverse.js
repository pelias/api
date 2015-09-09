
var generate = require('../../../query/reverse');

module.exports.tests = {};

function debug( a,b ){
  console.log( '----------------------' );
  console.log( JSON.stringify( a, null, 2 ) );
  console.log( '----------------------' );
  console.log( JSON.stringify( b, null, 2 ) );
  console.log( '----------------------' );
}

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof generate, 'function', 'valid function');
    t.end();
  });
};

module.exports.tests.query = function(test, common) {
  test('valid query', function(t) {
    var query = generate({
      lat: 29.49136, lon: -82.50622
    });
    
    var expected = require('../fixture/reverse_standard');
    t.deepEqual(query, expected, 'valid reverse query');
    t.end();
  });
  test('size fuzz test', function(t) {
    // test different sizes
    var sizes = [1,2,10,undefined,null];
    sizes.forEach( function( size ){
      var query = generate({
        lat: 29.49136, lon: -82.50622, size: size
      });

      t.equal( query.size, size ? size : 1, 'valid reverse query for size: '+ size);      
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