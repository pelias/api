var sanitizer = require('../../../sanitizer/_text_pelias_parser')();
var type_mapping = require('../../../helper/type_mapping');

module.exports.tests = {};


module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('sanitizer _text: ' + name, testFunction);
  }

  for (var testCase in module.exports.tests) {
    module.exports.tests[testCase](test, common);
  }
};
