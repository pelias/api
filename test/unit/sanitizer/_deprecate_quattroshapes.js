var sanitizer = require('../../../sanitizer/_deprecate_quattroshapes')();

module.exports.tests = {};

module.exports.tests.warning_message_1 = function(test, common) {
  test('[qs] should emit a deprecation warning', function(t) {
    var raw = { sources: 'qs' };
    var clean = {};

    var messages = sanitizer.sanitize(raw, clean);
    t.deepEquals(messages, {
      errors: [],
      warnings: ['You are using Quattroshapes as a data source in this query. ' +
       'Quattroshapes has been disabled as a data source for Mapzen Search, and has been' +
       'replaced by Who\'s on First, an actively maintained data project based on Quattroshapes' +
       'Your existing queries WILL CONTINUE TO WORK for the foreseeable future, but results will ' +
       'be coming from Who\'s on First and `sources=quattroshapes` will be interpreted as ' +
       '`sources=whosonfirst`. If you have any questions, please email search@mapzen.com.']
    }, 'warning emitted');

    t.end();
  });
};

module.exports.tests.warning_message_2 = function(test, common) {
  test('[quattroshapes] should emit a deprecation warning', function(t) {
    var raw = { sources: 'quattroshapes' };
    var clean = {};

    var messages = sanitizer.sanitize(raw, clean);
    t.deepEquals(messages, {
      errors: [],
      warnings: ['You are using Quattroshapes as a data source in this query. ' +
       'Quattroshapes has been disabled as a data source for Mapzen Search, and has been' +
       'replaced by Who\'s on First, an actively maintained data project based on Quattroshapes' +
       'Your existing queries WILL CONTINUE TO WORK for the foreseeable future, but results will ' +
       'be coming from Who\'s on First and `sources=quattroshapes` will be interpreted as ' +
       '`sources=whosonfirst`. If you have any questions, please email search@mapzen.com.']
    }, 'warning emitted');

    t.end();
  });
};

module.exports.tests.rewrite = function(test, common) {
  test('should rewrite qs and quattroshapes to whosonfirst', function(t) {
    var raw = { sources: 'qs,quattroshapes,qs,quattroshapes,osm' };
    var clean = {};

    sanitizer.sanitize(raw, clean);
    t.equals(raw.sources,'osm,whosonfirst','use wof instead of qs');

    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('SANITIZE _deprecate_quattroshapes ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
