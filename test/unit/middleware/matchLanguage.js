

var proxyquire = require('proxyquire');

var customConfig = {
  generate: function generate() {
    return {
      api: {
	languages: ['en', 'de', 'default' ] // priority order
      }
    };
  }
};

var matchLanguage = proxyquire('../../../middleware/matchLanguage', { 'pelias-config': customConfig });

module.exports.tests = {};

module.exports.tests.matchLanguage = function(test, common) {

  var address = {
    '_id': 'test1',
    '_type': 'test',
    'name': { 'default': 'München', 'de': 'München', 'en': 'Munich' }
  };

  var address2 = {
    '_id': 'test2',
    '_type': 'test',
    'name': { 'default': 'Hamburg', 'de': 'Hamburg', 'en': 'Hamburg' }
  };

  var address3 = {
    '_id': 'test2',
    '_type': 'test',
    'name': { 'default': '15 Osteweg', 'de': '15 Osteweg', 'en': '15 Osteweg' }
  };

  var req = {clean: { text: 'München', lang: 'en' }},
      res = { data: [ address ] },
      middleware = matchLanguage();

  test('name.de matches', function(t) {
    middleware( req, res, function next(){
      t.equal( req.clean.lang, 'de', 'language changed to matching German' );
      t.end();
    });
  });

  var req2 = {clean: { text: 'Hamburg' }}, // no explicit language selection
      res2 = { data: [ address2 ] };

  test('name.* versions match equally, use configured priority', function(t) {
    middleware( req2, res2, function next(){
      t.equal( req2.clean.lang, 'en', 'use highest priority matching language' );
      t.end();
    });
  });

  var req3 = {clean: { text: 'Hamburg', lang: 'de' }}, // explicit language selection
      res3 = { data: [ address2 ] };

  test('name.* versions match equally, use the lang from api', function(t) {
    middleware( req3, res3, function next(){
      t.equal( req3.clean.lang, 'de', 'use api defined language' );
      t.end();
    });
  });

  var req4 = {clean: { text: 'Music', lang: 'de' }}, // slightly similar to 'munich'
      res4 = { data: [ address ] };

  test('poor match does not change the language', function(t) {
    middleware( req4, res4, function next(){
      t.equal( req4.clean.lang, 'de', 'use api defined language' );
      t.end();
    });
  });

  var req5 = {clean: { text: 'Osteweg 15' }}, // street/number using German conventions
      res5 = { data: [ address3 ] };

  test('street/number order will not break matching', function(t) {
    middleware( req5, res5, function next(){
      t.equal( req5.clean.lang, 'en', 'language match with swapped house number works' );
      t.end();
    });
  });

};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('[middleware] matchLanguage: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
