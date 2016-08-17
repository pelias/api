var proxyquire =  require('proxyquire').noCallThru();

module.exports.tests = {};

module.exports.tests.sanitize = function(test, common) {
  test('verify that all sanitisers were called as expected when `res` is undefined', function(t) {
    var called_sanitisers = [];

    // rather than re-verify the functionality of all the sanitisers, this test just verifies that they
    //  were all called correctly
    var search = proxyquire('../../../sanitiser/search_fallback', {
      '../sanitiser/_text_autocomplete': function() {
        called_sanitisers.push('_text_autocomplete');
        return { errors: [], warnings: [] };
      }
    });

    var expected_sanitisers = [
      '_text_autocomplete'
    ];

    var req = {};

    search.middleware(req, undefined, function(){
      t.deepEquals(called_sanitisers, expected_sanitisers);
      t.end();
    });

  });

  test('verify that all sanitisers were called as expected when `res` has no `data` property', function(t) {
    var called_sanitisers = [];

    // rather than re-verify the functionality of all the sanitisers, this test just verifies that they
    //  were all called correctly
    var search = proxyquire('../../../sanitiser/search_fallback', {
      '../sanitiser/_text_autocomplete': function() {
        called_sanitisers.push('_text_autocomplete');
        return { errors: [], warnings: [] };
      }
    });

    var expected_sanitisers = [
      '_text_autocomplete'
    ];

    var req = {};
    var res = {};

    search.middleware(req, res, function(){
      t.deepEquals(called_sanitisers, expected_sanitisers);
      t.end();
    });

  });

  test('verify that all sanitisers were called as expected when res.data is empty', function(t) {
    var called_sanitisers = [];

    // rather than re-verify the functionality of all the sanitisers, this test just verifies that they
    //  were all called correctly
    var search = proxyquire('../../../sanitiser/search_fallback', {
      '../sanitiser/_text_autocomplete': function() {
        called_sanitisers.push('_text_autocomplete');
        return { errors: [], warnings: [] };
      }
    });

    var expected_sanitisers = [
      '_text_autocomplete'
    ];

    var req = {};
    var res = {
      data: []
    };

    search.middleware(req, res, function(){
      t.deepEquals(called_sanitisers, expected_sanitisers);
      t.end();
    });

  });

  test('non-empty res.data should not call the _text_autocomplete sanitiser', function(t) {
    var called_sanitisers = [];

    // rather than re-verify the functionality of all the sanitisers, this test just verifies that they
    //  were all called correctly
    var search = proxyquire('../../../sanitiser/search_fallback', {
      '../sanitiser/_text_autocomplete': function() {
        throw new Error('_text_autocomplete sanitiser should not have been called');
      }
    });

    var expected_sanitisers = [];

    var req = {};
    var res = {
      data: [{}]
    };

    search.middleware(req, res, function(){
      t.deepEquals(called_sanitisers, expected_sanitisers);
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
