var generate = require('../../../query/autocomplete');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof generate, 'function', 'valid function');
    t.end();
  });
};

module.exports.tests.query = function(test, common) {
  test('exclude railreplacementBus', function(t) {
    var query = generate({
      text: 'BussForTog',
      tokens: ['BussForTog'],
      tokens_complete: [],
      tokens_incomplete: ['BussForTog']
    });
    
    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/autocomplete_exclude_railreplacement_bus');

    t.deepEqual(compiled.type, 'autocomplete', 'query type set');
    t.deepEqual(compiled.body, expected, 'autocomplete_exclude_railreplacement_bus');

    t.end();
  });
};

module.exports.all = function (tape, common) {
  
  function test(name, testFunction) {
    return tape('autocomplete exclude railreplacementBus ' + name, testFunction);
  }
  
  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};