

var proxyquire = require('proxyquire');

var customConfig = {
  generate: function generate() {
    return {
      api: {
        languages: ['en', 'de', 'default' ]
      }
    };
  }
};

var selectLanguage = proxyquire('../../../middleware/languageSelector', { 'pelias-config': customConfig });

module.exports.tests = {};

module.exports.tests.selectLanguage = function(test, common) {

  var req = {clean: { text: 'example address', lang: 'de' }}, // explicit 'lang' selection
      res = { data: [] },
      middleware = selectLanguage();

  test('language set by api is not changed', function(t) {
    middleware( req, res, function next(){
      t.equal( req.clean.lang, 'de', 'lang does not change unexpectedly' );
      t.end();
    });
  });

  var req2 = {clean: { text: 'example address' }}; // 'lang' not set

  test('take languge from pelias configuration', function(t) {
    middleware( req2, res, function next(){
      t.equal( req2.clean.lang, 'en', 'use highest priority language' );
      t.end();
    });
  });

  var req3 = {clean: { text: 'example address' }}, // 'lang' not set
      middleware2 = selectLanguage({}); // empty pelias config without language list

  test('default to default', function(t) {
    middleware2( req3, res, function next(){
      t.equal( req3.clean.lang, 'default', 'lang correctly defaults to ´default´' );
      t.end();
    });
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('[middleware] languageSelector: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
