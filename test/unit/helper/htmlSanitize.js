const sanitize = require('../../../helper/htmlSanitize');
module.exports.tests = {};

module.exports.tests.remove = function (test, common) {
  test('remove: LINK tags', (t) => {
    t.deepEquals(sanitize('AAA <link href="evil.css" /> BBB'), 'AAA BBB');
    t.end();
  });
  test('remove: SCRIPT tags', (t) => {
    t.deepEquals(sanitize('AAA <script src="evil.js" /> BBB'), 'AAA BBB');
    t.end();
  });
  test('remove: STYLE tags', (t) => {
    t.deepEquals(sanitize('AAA <style>.evil { color: red; }</style> BBB'), 'AAA BBB');
    t.end();
  });
  test('remove: XML tags', (t) => {
    t.deepEquals(sanitize('AAA <xml><evil /></xml> BBB'), 'AAA BBB');
    t.end();
  });
};

module.exports.tests.keep_contents = function (test, common) {
  test('keep contents: P tags', (t) => {
    t.deepEquals(sanitize('AAA <p>CCC</p> BBB'), 'AAA CCC BBB');
    t.end();
  });
  test('keep contents: nested safe tags', (t) => {
    t.deepEquals(sanitize('AAA <p><em>CCC</em></p> BBB'), 'AAA CCC BBB');
    t.end();
  });
  test('keep contents: invalid nested safe tags (missing closing tag)', (t) => {
    t.deepEquals(sanitize('AAA <p><em>CCC</p> BBB'), 'AAA CCC BBB');
    t.end();
  });
};

module.exports.tests.types = function (test, common) {
  test('string', (t) => {
    t.deepEquals(sanitize('AAA <link href="evil.css" /> BBB'), 'AAA BBB');
    t.end();
  });
  test('string - empty', (t) => {
    t.deepEquals(sanitize(''), '');
    t.end();
  });
  test('number', (t) => {
    t.deepEquals(sanitize(0.1), 0.1);
    t.end();
  });
  test('number - empty', (t) => {
    t.deepEquals(sanitize(NaN), NaN);
    t.end();
  });
  test('array', (t) => {
    t.deepEquals(sanitize([
      'AAA <link href="evil.css" /> BBB',
      'CCC <script src="evil.js" /> DDD'
    ]), [
      'AAA BBB',
      'CCC DDD'
    ]);
    t.end();
  });
  test('array - empty', (t) => {
    t.deepEquals(sanitize([]), []);
    t.end();
  });
  test('object', (t) => {
    t.deepEquals(sanitize({
      a: 'AAA <link href="evil.css" /> BBB',
      b: 'CCC <script src="evil.js" /> DDD'
    }), {
      a: 'AAA BBB',
      b: 'CCC DDD'
    });
    t.end();
  });
  test('object - empty', (t) => {
    t.deepEquals(sanitize({}), {});
    t.end();
  });
  test('null', (t) => {
    t.deepEquals(sanitize(null), null);
    t.end();
  });
  test('undefined', (t) => {
    t.deepEquals(sanitize(undefined), undefined);
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('[helper] htmlSanitize: ' + name, testFunction);
  }

  for (var testCase in module.exports.tests) {
    module.exports.tests[testCase](test, common);
  }
};
