
var middleware = require('../../../middleware/requestLanguage');
module.exports.tests = {};

var DEFAULTS = {
  defaulted: true,
  iso6391: 'en',
  iso6392B: 'eng',
  iso6392T: 'eng',
  iso6393: 'eng',
  name: 'English',
  scope: 'individual',
  type: 'living'
};

module.exports.tests.defaults = function(test, common) {
  test('default language', function(t) {

    var req = {};

    middleware(req, {}, function () {
      t.deepEqual( req.language, DEFAULTS, '$req.language set' );

      t.deepEqual( req.clean.lang, {
        defaulted: req.language.defaulted,
        iso6391: req.language.iso6391,
        iso6393: req.language.iso6393,
        name: req.language.name
      }, '$req.clean.lang set' );

      t.deepEqual( req.warnings, []);

      t.end();
    });
  });
  test('both querystring & header invalid', function(t) {

    var req = {
      headers: { 'accept-language': 'foobar' },
      query: { 'lang': 'foobar' }
    };

    middleware(req, {}, function () {
      t.deepEqual( req.language, DEFAULTS, '$req.language set' );

      t.deepEqual( req.clean.lang, {
        defaulted: req.language.defaulted,
        iso6391: req.language.iso6391,
        iso6393: req.language.iso6393,
        name: req.language.name
      }, '$req.clean.lang set' );

      t.deepEqual( req.warnings, [
        'invalid language provided via querystring',
        'invalid language provided via header'
      ]);

      t.end();
    });
  });
};

module.exports.tests.invalid = function(test, common) {
  test('headers: invalid language', function(t) {

    var req = { headers: {
      'accept-language': 'invalid language'
    }};

    middleware(req, {}, function () {
      t.deepEqual( req.language, DEFAULTS, '$req.language set' );

      t.deepEqual( req.clean.lang, {
        defaulted: req.language.defaulted,
        iso6391: req.language.iso6391,
        iso6393: req.language.iso6393,
        name: req.language.name
      }, '$req.clean.lang set' );

      t.deepEqual( req.warnings, [
        'invalid language provided via header'
      ]);

      t.end();
    });
  });
  test('query: invalid language', function(t) {

    var req = { query: {
      lang: 'invalid language'
    }};

    middleware(req, {}, function () {
      t.deepEqual( req.language, DEFAULTS, '$req.language set' );

      t.deepEqual( req.clean.lang, {
        defaulted: req.language.defaulted,
        iso6391: req.language.iso6391,
        iso6393: req.language.iso6393,
        name: req.language.name
      }, '$req.clean.lang set' );

      t.deepEqual( req.warnings, [
        'invalid language provided via querystring'
      ]);

      t.end();
    });
  });
};

module.exports.tests.valid = function(test, common) {
  test('headers: valid language - french', function(t) {

    var req = { headers: {
      'accept-language': 'fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5'
    }};

    var expected = {
      defaulted: false,
      iso6391: 'fr',
      iso6392B: 'fre',
      iso6392T: 'fra',
      iso6393: 'fra',
      name: 'French',
      scope: 'individual',
      type: 'living'
    };

    middleware(req, {}, function () {
      t.deepEqual( req.language, expected, '$req.language set' );

      t.deepEqual( req.clean.lang, {
        defaulted: req.language.defaulted,
        iso6391: req.language.iso6391,
        iso6393: req.language.iso6393,
        name: req.language.name
      }, '$req.clean.lang set' );

      t.deepEqual( req.warnings, []);

      t.end();
    });
  });
  test('query: valid language - french', function(t) {

    var req = { query: {
      lang: 'fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5'
    }};

    var expected = {
      defaulted: false,
      iso6391: 'fr',
      iso6392B: 'fre',
      iso6392T: 'fra',
      iso6393: 'fra',
      name: 'French',
      scope: 'individual',
      type: 'living'
    };

    middleware(req, {}, function () {
      t.deepEqual( req.language, expected, '$req.language set' );

      t.deepEqual( req.clean.lang, {
        defaulted: req.language.defaulted,
        iso6391: req.language.iso6391,
        iso6393: req.language.iso6393,
        name: req.language.name
      }, '$req.clean.lang set' );

      t.deepEqual( req.warnings, []);

      t.end();
    });
  });

  test('headers: valid language - english', function(t) {

    var req = { headers: {
      'accept-language': 'en'
    }};

    var expected = {
      defaulted: false,
      iso6391: 'en',
      iso6392B: 'eng',
      iso6392T: 'eng',
      iso6393: 'eng',
      name: 'English',
      scope: 'individual',
      type: 'living'
    };

    middleware(req, {}, function () {
      t.deepEqual( req.language, expected, '$req.language set' );

      t.deepEqual( req.clean.lang, {
        defaulted: req.language.defaulted,
        iso6391: req.language.iso6391,
        iso6393: req.language.iso6393,
        name: req.language.name
      }, '$req.clean.lang set' );

      t.deepEqual( req.warnings, []);

      t.end();
    });
  });
  test('query: valid language - english', function(t) {

    var req = { query: {
      lang: 'en'
    }};

    var expected = {
      defaulted: false,
      iso6391: 'en',
      iso6392B: 'eng',
      iso6392T: 'eng',
      iso6393: 'eng',
      name: 'English',
      scope: 'individual',
      type: 'living'
    };

    middleware(req, {}, function () {
      t.deepEqual( req.language, expected, '$req.language set' );

      t.deepEqual( req.clean.lang, {
        defaulted: req.language.defaulted,
        iso6391: req.language.iso6391,
        iso6393: req.language.iso6393,
        name: req.language.name
      }, '$req.clean.lang set' );

      t.deepEqual( req.warnings, []);

      t.end();
    });
  });
};

module.exports.tests.precedence = function(test, common) {
  test('precedence: query has precedence over headers', function(t) {

    var req = {
      headers: { 'accept-language': 'fr' },
      query: { 'lang': 'es' }
    };

    var expected = {
      defaulted: false,
      iso6391: 'es',
      iso6392B: 'spa',
      iso6392T: 'spa',
      iso6393: 'spa',
      name: 'Spanish',
      scope: 'individual',
      type: 'living'
    };

    middleware(req, {}, function () {
      t.deepEqual( req.language, expected, '$req.language set' );

      t.deepEqual( req.clean.lang, {
        defaulted: req.language.defaulted,
        iso6391: req.language.iso6391,
        iso6393: req.language.iso6393,
        name: req.language.name
      }, '$req.clean.lang set' );

      t.deepEqual( req.warnings, []);

      t.end();
    });
  });
  test('precedence: invalid querystring but valid header', function(t) {

    var req = {
      headers: { 'accept-language': 'fr' },
      query: { 'lang': 'foobar' }
    };

    var expected = {
      defaulted: false,
      iso6391: 'fr',
      iso6392B: 'fre',
      iso6392T: 'fra',
      iso6393: 'fra',
      name: 'French',
      scope: 'individual',
      type: 'living'
    };

    middleware(req, {}, function () {
      t.deepEqual( req.language, expected, '$req.language set' );

      t.deepEqual( req.clean.lang, {
        defaulted: req.language.defaulted,
        iso6391: req.language.iso6391,
        iso6393: req.language.iso6393,
        name: req.language.name
      }, '$req.clean.lang set' );

      t.deepEqual( req.warnings, [
        'invalid language provided via querystring'
      ]);

      t.end();
    });
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('[middleware] requestLanguage: ' + name, testFunction);
  }
  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
