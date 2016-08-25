var schemas = require('../../../helper/labelSchema');
var alpha3  = require('../mock/alpha3.json');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('interface', function(t) {
    t.equal(typeof schemas, 'object', 'valid object');
    t.equal(schemas.hasOwnProperty('default'), true, 'has default defined');
    t.end();
  });
};

module.exports.tests.supported_countries = function(test, common) {
  test('supported countries', function(t) {
    var supported_countries = Object.keys(schemas);

    t.notEquals(supported_countries.indexOf('USA'), -1);
    t.notEquals(supported_countries.indexOf('CAN'), -1);
    t.notEquals(supported_countries.indexOf('GBR'), -1);
    t.notEquals(supported_countries.indexOf('AUS'), -1);
    t.notEquals(supported_countries.indexOf('default'), -1);
    t.equals(supported_countries.length, 5);

    t.equals(Object.keys(schemas.USA).length, 4);
    t.equals(Object.keys(schemas.CAN).length, 3);
    t.equals(Object.keys(schemas.GBR).length, 3);
    t.equals(Object.keys(schemas.AUS).length, 3);
    t.equals(Object.keys(schemas.default).length, 2);

    t.end();

  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('schemas: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
