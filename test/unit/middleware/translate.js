
var proxyquire = require('proxyquire');
var _ = require('lodash');

var customConfig = {
  generate: function generate() {
    return {
      api : {
        localization : { // expand the set of flipped countries
          translations: './translations.json',
        }
      }
    };
  }
};
var translate = proxyquire('../../../middleware/translate', { 'pelias-config': customConfig });

module.exports.tests = {};


module.exports.tests.translateNames = function(test, common) {

  var translationAddress = {
    '_id': 'test5',
    '_type': 'test',
    'name': { 'default': 'München', 'de': 'München', 'en': 'Munich' },
    'center_point': { 'lon': 11.58646, 'lat': 48.13679},
    'parent': {
      'region': ['Bayern'],
      'locality': ['München'],
      'country_a': ['DEU'],
      'country': ['Germany']
    }
  };
  var address2 = _.cloneDeep(translationAddress);
  var address3 = _.cloneDeep(translationAddress);

  var req = {clean: { text: 'München', lang:'en' }},
      res = { data: [ translationAddress ] },
      middleware = translate();

  test('translate to English', function(t) {

    middleware( req, res, function next(){
      t.equal( res.data[0].parent.locality[0], 'Munich', 'locality translated to English' );
      t.equal( res.data[0].parent.region[0], 'Bavaria', 'region translated to English' );
      t.equal( res.data[0].parent.country[0], 'Germany', 'country in English' );
      t.end();
    });
  });

  var req2 = {clean: { text: 'München', lang:'de' }},
      res2 = { data: [ address2 ] };

  test('translate to German', function(t) {
    middleware( req2, res2, function next(){
      t.equal( res2.data[0].parent.locality[0], 'München', 'locality in German' );
      t.equal( res2.data[0].parent.region[0], 'Bayern', 'region in German' );
      t.equal( res2.data[0].parent.country[0], 'Deutschland', 'country translated to German' );
      t.end();
    });
  });

  var req3 = {clean: { text: 'München' }}, // no lang param at all
      res3 = { data: [ address3 ] };

  test('no translation', function(t) {
    middleware( req3, res3, function next(){
      t.equal( res3.data[0].parent.locality[0], 'München', 'locality in original language' );
      t.equal( res3.data[0].parent.region[0], 'Bayern', 'region in original language' );
      t.equal( res3.data[0].parent.country[0], 'Germany', 'country in original language' );
      t.end();
    });
  });

};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('[middleware] translate: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
