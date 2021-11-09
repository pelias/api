var defaults = require('../../../query/search_defaults');

module.exports.tests = {};

module.exports.tests.interface = function (test, common) {
  test('valid interface', function (t) {
    t.equal(typeof defaults, 'object', 'defaults defined');
    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('search defaults ' + name, testFunction);
  }

  for (var testCase in module.exports.tests) {
    module.exports.tests[testCase](test, common);
  }
};
