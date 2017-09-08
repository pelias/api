const stackTraceLine = require('../../../helper/stackTraceLine');

module.exports.tests = {};
module.exports.tests.stackTrace = (test, common) => {
  test('No exceptions thrown when function is called', (t) => {
    t.doesNotThrow(stackTraceLine, 'No exceptions thrown');
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('[helper] stackTraceLine: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
