var sanitize = require('../../../sanitizer/_lang');

module.exports.tests = {};

module.exports.tests.sanitize_lang = function(test, common) {
  test('lang=fi', function(t) {
    var raw = { lang: 'fi' };
    var clean = {};
    var res = sanitize(raw, clean);
    t.equal(res.errors.length, 0, 'should return no errors');
    t.equal(clean.lang, 'fi', 'lang setting considered');
    t.end();
  });

  test('lang not set', function(t) {
    var raw = {};
    var clean = {};
    var res = sanitize(raw, clean);
    t.equal(res.errors.length, 0, 'should return no errors');
    t.equal(res.warnings.length, 0, 'should return no warning');
    t.equal(clean.lang, undefined, 'default to undefined');
    t.end();
  });

};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('SANTIZE _lang ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
