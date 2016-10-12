var proxyquire =  require('proxyquire').noCallThru();

module.exports.tests = {};

module.exports.tests.sanitize = function(test, common) {
  test('verify that all sanitizers were called as expected when `res` is undefined', function(t) {
    var called_sanitizers = [];

    // rather than re-verify the functionality of all the sanitizers, this test just verifies that they
    //  were all called correctly
    var search = proxyquire('../../../sanitizer/search_fallback', {
      '../sanitizer/_text_addressit': function() {
        called_sanitizers.push('_text_addressit');
        return { errors: [], warnings: [] };
      }
    });

    var expected_sanitizers = [
      '_text_addressit'
    ];

    var req = {};

    search.middleware(req, undefined, function(){
      t.deepEquals(called_sanitizers, expected_sanitizers);
      t.end();
    });

  });

  test('verify that all sanitizers were called as expected when `res` has no `data` property', function(t) {
    var called_sanitizers = [];

    // rather than re-verify the functionality of all the sanitizers, this test just verifies that they
    //  were all called correctly
    var search = proxyquire('../../../sanitizer/search_fallback', {
      '../sanitizer/_text_addressit': function() {
        called_sanitizers.push('_text_addressit');
        return { errors: [], warnings: [] };
      }
    });

    var expected_sanitizers = [
      '_text_addressit'
    ];

    var req = {};
    var res = {};

    search.middleware(req, res, function(){
      t.deepEquals(called_sanitizers, expected_sanitizers);
      t.end();
    });

  });

  test('verify that all sanitizers were called as expected when res.data is empty', function(t) {
    var called_sanitizers = [];

    // rather than re-verify the functionality of all the sanitizers, this test just verifies that they
    //  were all called correctly
    var search = proxyquire('../../../sanitizer/search_fallback', {
      '../sanitizer/_text_addressit': function() {
        called_sanitizers.push('_text_addressit');
        return { errors: [], warnings: [] };
      }
    });

    var expected_sanitizers = [
      '_text_addressit'
    ];

    var req = {};
    var res = {
      data: []
    };

    search.middleware(req, res, function(){
      t.deepEquals(called_sanitizers, expected_sanitizers);
      t.end();
    });

  });

  test('non-empty res.data should not call the _text_autocomplete sanitizer', function(t) {
    var called_sanitizers = [];

    // rather than re-verify the functionality of all the sanitizers, this test just verifies that they
    //  were all called correctly
    var search = proxyquire('../../../sanitizer/search_fallback', {
      '../sanitizer/_text_autocomplete': function() {
        throw new Error('_text_autocomplete sanitizer should not have been called');
      }
    });

    var expected_sanitizers = [];

    var req = {};
    var res = {
      data: [{}]
    };

    search.middleware(req, res, function(){
      t.deepEquals(called_sanitizers, expected_sanitizers);
      t.end();
    });

  });

};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('SANITIZE /search_fallback ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
