var autocomplete = require('../../../sanitiser/autocomplete');

module.exports.tests = {};

module.exports.tests.sanitisers = function(test, common) {
  test('check sanitiser list', function (t) {
    var expected = [
      'singleScalarParameters', 'text', 'tokenizer', 'size', 'layers', 'sources',
      'sources_and_layers', 'private', 'geo_autocomplete'
    ];
    t.deepEqual(Object.keys(autocomplete.sanitiser_list), expected);
    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('SANTIZE /autocomplete ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
