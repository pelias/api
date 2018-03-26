const field = require('../../../helper/fieldValue');

module.exports.tests = {};

module.exports.tests.getStringValue = function(test) {
  test('getStringValue', function(t) {
    t.equal(field.getStringValue([]), '', 'empty array');
    t.equal(field.getStringValue(''), '', 'empty string');
    t.equal(field.getStringValue('foo'), 'foo', 'string');
    t.equal(field.getStringValue(['foo','bar']), 'foo', 'array');
    t.equal(field.getStringValue(['']), '', 'array with empty string');
    t.equal(field.getStringValue(-0), '-0', 'number');
    t.equal(field.getStringValue(+0), '0', 'number');

    // note: this behaviour is not desirable, it was inherited during a refactor
    // see: https://github.com/pelias/api/pull/1102
    t.equal(field.getStringValue({foo: 'bar'}), '[object Object]', '_.toString');
    t.end();
  });
};

module.exports.tests.getArrayValue = function(test) {
  test('getArrayValue', function(t) {
    t.deepEqual(field.getArrayValue([]), [], 'empty array');
    t.deepEqual(field.getArrayValue(''), [], 'empty string');
    t.deepEqual(field.getArrayValue('foo'), ['foo'], 'string');
    t.deepEqual(field.getArrayValue(['foo','bar']), ['foo','bar'], 'array');
    t.deepEqual(field.getArrayValue(['']), [''], 'array with empty string');
    t.deepEqual(field.getArrayValue(-0), [0], 'number');
    t.deepEqual(field.getArrayValue(+0), [0], 'number');
    t.deepEqual(field.getArrayValue({foo: 'bar'}), [{foo: 'bar'}], '[*]');
    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('fieldValue: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
