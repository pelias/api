
var controller = require('../../../controller/index');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof controller, 'function', 'controller is a function');
    t.end();
  });
};

module.exports.tests.info = function(test, common) {
  test('returns server info', function(t) {
    var res = { json: function( json ){
      t.equal(typeof json, 'object', 'returns json');
      t.equal(typeof json.name, 'string', 'name');
      t.equal(typeof json.version, 'object', 'version');
      t.equal(typeof json.version.number, 'string', 'version number');
      t.end();
    }};
    controller( null, res );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('GET / ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};