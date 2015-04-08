
var schemas = require('../../../helper/outputSchema.json');
var alpha3  = require('../mock/alpha3.json');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('interface', function(t) {
    t.equal(typeof schemas, 'object', 'valid object');
    t.equal(schemas.hasOwnProperty('default'), true, 'has default defined');
    t.end();
  });
};

module.exports.tests.valid = function(test, common) {
  var valid_keys = ['local_admin', 'locality', 'neighborhood', 'admin2', 'admin1_abbr', 'admin1', 'admin0', 'alpha3'];
  var default_schema = {
    local: ['local_admin', 'locality', 'neighborhood', 'admin2'],
    regional: ['admin1_abbr', 'admin1'],
    national: ['alpha3', 'admin0']
  };

  var isValid = function(keys, schema) {
    test('valid key/object (' + keys + ')' , function(t) {
      if (keys === 'default') { 
        t.deepEqual(schema, default_schema, 'valid default schema');
      } else {
        t.equal(alpha3.hasOwnProperty(keys), true, 'valid key');  
      }
      t.equal(typeof schema, 'object', 'valid object');
      t.notEqual(Object.getOwnPropertyNames(schema).length, 0,  'object not empty');
      for (var levels in schema) {
        t.equal(Object.prototype.toString.call(schema[levels]), '[object Array]', levels+' is an array');
        for (var i=0;i<schema[levels].length;i++) {
          var key = schema[levels][i];
          t.notEqual(valid_keys.indexOf(key), -1, key + ' is valid');
        }
      }
      t.end();
    });
  };

  for (var keys in schemas) { 
    isValid(keys, schemas[keys]);
  }
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('schemas: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};