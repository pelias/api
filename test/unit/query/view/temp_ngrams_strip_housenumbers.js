var peliasQuery = require('pelias-query');
var ngramsStripHouseNumbersView = require('../../../../query/view/temp_ngrams_strip_housenumbers');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof ngramsStripHouseNumbersView, 'function', 'valid function');
    t.equal(typeof ngramsStripHouseNumbersView.removeHouseNumber, 'function', 'valid function');
    t.end();
  });
};

module.exports.tests.view = function(test, common) {
  var view = ngramsStripHouseNumbersView;
  test('input:name set', function(t) {

    var vs1 = new peliasQuery.Vars( peliasQuery.defaults );
    vs1.var('input:name').set('101 west 26th street');

    var compiled = JSON.stringify( view( vs1 ) );
    var expected = '{"match":{"name.default":{"analyzer":"peliasOneEdgeGram","boost":1,"query":"west 26th street"}}}';

    t.equal(compiled, expected, 'view compiled correctly');
    t.equal(vs1.var('input:name').get(), '101 west 26th street', 'original var not mutated');

    t.end();
  });
  test('input:name not set', function(t) {

    var vs1 = new peliasQuery.Vars( peliasQuery.defaults );
    t.equal(view(vs1), null, 'view failed compilation due to missing var');

    t.end();
  });
};

module.exports.tests.removeHouseNumber = function(test, common) {
  var rm = ngramsStripHouseNumbersView.removeHouseNumber;
  test('removeHouseNumber', function(t) {

    t.equal(rm('101 west 26th street'), 'west 26th street', 'house number removed');
    t.equal(rm('10th avenue'), '10th avenue', 'don\'t remove ordinal numbers');
    t.equal(rm('123 main st new york ny 10010 US'), 'main st new york ny US', 'also removes postcodes');

    // in this case we need to avoid stripping ALL the numbers and leaving only stop words
    // because in this case the analyser will return in a blank input string.
    // eg. the same issue exists for 'avenue street' (not covered here).
    t.equal(rm('1359 54 street'), '1359 54 street', 'avoid stripping ALL valid tokens');
    t.equal(rm('310 7 street'), '310 7 street', 'avoid stripping ALL valid tokens');

    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('ngrams strip housenumber view: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
