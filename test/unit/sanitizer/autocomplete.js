var autocomplete = require('../../../sanitizer/autocomplete');

module.exports.tests = {};

module.exports.tests.sanitizers = function(test, common) {
  test('check sanitizer list', function (t) {
    var expected = [
      'singleScalarParameters', 'text', 'tokenizer', 'size', 'layers', 'sources',
      'sources_and_layers', 'private', 'geo_autocomplete', 'boundary_country', 'categories'
    ];
    t.deepEqual(Object.keys(autocomplete.sanitizer_list), expected);
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
