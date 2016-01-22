var sanitiser = require('../../../sanitiser/_text');
var type_mapping = require('../../../helper/type_mapping');

module.exports.tests = {};

module.exports.tests.text_parser = function(test, common) {
  test('short input text has admin layers set ', function(t) {
    var raw = {
      text: 'emp'  //start of empire state building
    };
    var clean = {
    };

    var messages = sanitiser(raw, clean);

    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');

    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('SANITISER _text: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
