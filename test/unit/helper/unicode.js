const unicode = require('../../../helper/unicode');

module.exports.tests = {};

module.exports.tests.normalize = function (test) {
  const norm = unicode.normalize;
  test('normalize: NFKC', function (t) {
    let decomposed = String.fromCharCode(105) + String.fromCharCode(776);
    let composed = String.fromCharCode(239);
    t.equal(norm(decomposed), composed);
    t.equal(norm(composed), composed);
    t.end();
  });
  test('normalize: NFKC', function (t) {
    let decomposed = '²';
    let composed = '2';
    t.equal(norm(decomposed), composed);
    t.equal(norm(composed), composed);
    t.end();
  });
  test('normalize: remove control codes', function (t) {
    t.equal(norm('a\u0000b\u001Fc'), 'abc');
    t.equal(norm('a\u007Fb\u007Fc'), 'abc');
    t.equal(norm('a\u0080b\u009Fc'), 'abc');
    t.end();
  });
  test('normalize: convert alt spaces', function (t) {
    t.equal(norm('a b\u00A0c\u00A0d'), 'a b c d');
    t.equal(norm('a b\u180Ec\u2000d'), 'a b c d');
    t.equal(norm('a b\u205Fc\uFEFFd'), 'a b c d');
    t.end();
  });
  test('normalize: strip extra combining marks', function (t) {
    let decomposed = String.fromCharCode(32) + String.fromCharCode(776);
    let composed = String.fromCharCode(32);
    t.equal(norm(decomposed), composed);
    t.equal(norm(composed), composed);
    t.end();
  });
  test('normalize: strip unsupported symbols', function (t) {
    t.equal(norm('↸a⇨b'), 'ab', 'arrows');
    t.equal(norm('╦a╳b'), 'ab', 'box drawing');
    t.equal(norm('𝄞a𝇎b'), 'ab', 'muscial symbols');
    t.equal(norm('💩a😎b'), 'ab', 'emoji');
    t.equal(norm('🙌🏿a🙌🏻b'), 'ab', 'emoji');
    t.equal(norm('new york ❤️usa'), 'new york usa', 'dingbat + variation selector');
    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('unicode: ' + name, testFunction);
  }

  for (var testCase in module.exports.tests) {
    module.exports.tests[testCase](test, common);
  }
};
