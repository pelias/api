/**
 * Tests for the `config/queryAdminWeights` configuration file.
 */

var queryAdminWeights = require( '../../../config/queryAdminWeights' );
var isObject = require( 'is-object' );

module.exports.tests = {};

module.exports.tests.interface = function (test, common){
  test('interface', function (t){
    t.ok( isObject( queryAdminWeights ), 'Module exports an object.' );
    for( var key in queryAdminWeights ){
      t.equal( typeof queryAdminWeights[ key ], 'number', 'Weight is a number.' );
    }
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('queryAdminWeights: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
