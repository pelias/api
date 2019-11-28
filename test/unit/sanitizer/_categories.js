var sanitizer = require( '../../../sanitizer/_categories')();

module.exports.tests = {};

module.exports.tests.no_categories = function(test, common) {
  test('categories not set', function(t) {
    var req = {
      query: { },
      clean: { }
    };

    var messages = sanitizer.sanitize(req.query, req.clean);

    t.equal(req.clean.categories, undefined, 'no categories should be defined');
    t.deepEqual(messages.errors, [], 'no error returned');
    t.deepEqual(messages.warnings, [], 'no warnings returned');
    t.end();
  });

  test('categories is empty string', function(t) {
    var req = {
      query: {
        categories: ''
      },
      clean: { }
    };

    var expected_warning = 'Categories parameter left blank, showing results from all categories.';

    var messages = sanitizer.sanitize(req.query, req.clean);

    t.deepEqual(req.clean.categories, [], 'empty categories array should be defined');
    t.deepEqual(messages.errors, [], 'no errors returned');
    t.deepEqual(messages.warnings.length, 1, 'warning returned');
    t.deepEqual(messages.warnings[0], expected_warning, 'warning returned');
    t.end();
  });

  test('categories is an array of empty strings', function(t) {
    var req = {
      query: {
        categories: ',,'
      },
      clean: { }
    };

    var expected_warning = 'Categories parameter left blank, showing results from all categories.';

    var messages = sanitizer.sanitize(req.query, req.clean);

    t.deepEqual(req.clean.categories, [], 'empty categories array should be defined');
    t.deepEqual(messages.errors, [], 'no errors returned');
    t.deepEqual(messages.warnings.length, 1, 'warning returned');
    t.deepEqual(messages.warnings[0], expected_warning, 'warning returned');
    t.end();
  });

  test('categories is mix of valid categories and empty strings', function (t) {
    var req = {
      query: {
        categories: ',food,'
      },
      clean: {}
    };

    var messages = sanitizer.sanitize(req.query, req.clean);
    t.deepEqual(req.clean.categories, ['food'], 'junk trimmed');
    t.deepEqual(messages.errors, [], 'no errors returned');
    t.deepEqual(messages.warnings, [], 'no warnings returned');
    t.end();
  });
};

module.exports.tests.valid_categories = function(test, common) {
  var isValidCategoryCalled = 0;
  var validCategories = {
    isValidCategory: function (cat) {
      isValidCategoryCalled++;
      return ['food','health','financial','education','government'].indexOf(cat) !== -1; }
  };

  test('single category', function(t) {
    isValidCategoryCalled = 0;

    var req = {
      query: {
        categories: 'food'
      },
      clean: { }
    };

    var messages = sanitizer.sanitize(req.query, req.clean, validCategories);

    t.deepEqual(req.clean.categories, ['food'], 'categories should contain food');
    t.deepEqual(messages.errors, [], 'no error returned');
    t.deepEqual(messages.warnings, [], 'no warnings returned');

    t.equal(isValidCategoryCalled, 1);

    t.end();
  });

  test('multiple categories', function(t) {
    isValidCategoryCalled = 0;
    var req = {
      query: {
        categories: 'food,health'
      },
      clean: { }
    };
    var expectedCategories = ['food', 'health'];

    var messages = sanitizer.sanitize(req.query, req.clean, validCategories);

    t.deepEqual(req.clean.categories, expectedCategories,
                'clean.categories should be an array with proper values');
    t.deepEqual(messages.errors, [], 'no error returned');
    t.deepEqual(messages.warnings, [], 'no warnings returned');

    t.equal(isValidCategoryCalled, expectedCategories.length);

    t.end();
  });
};

module.exports.tests.invalid_categories = function(test, common) {
  var isValidCategoryCalled = 0;
  var validCategories = {
    isValidCategory: function (cat) {
      isValidCategoryCalled++;
      return ['food','health','financial','education','government'].indexOf(cat) !== -1; }
  };

  test('garbage category', function(t) {
    var req = {
      query: {
        categories: 'barf'
      },
      clean: { }
    };
    var expected_messages = {
      errors: [],
      warnings: [
        'Categories parameter left blank, showing results from all categories.'
      ]
    };

    var messages = sanitizer.sanitize(req.query, req.clean, validCategories);

    t.deepEqual(messages, expected_messages, 'error with message returned');
    t.deepEqual(req.clean.categories, [], 'empty categories array should be defined');
    t.end();
  });

  test('all garbage categories', function(t) {
    var req = {
      query: {
        categories: 'barf,bleh'
      },
      clean: { }
    };
    var expected_messages = {
      errors: [],
      warnings: [
        'Categories parameter left blank, showing results from all categories.'
      ]
    };

    var messages = sanitizer.sanitize(req.query, req.clean, validCategories);

    t.deepEqual(messages, expected_messages, 'error with message returned');
    t.deepEqual(req.clean.categories, [], 'empty categories array should be defined');
    t.end();
  });

  test('return an array of expected parameters in object form for validation', (t) => {
    const expected = [{ name: 'categories' }];

    const validParameters = sanitizer.expected();

    t.deepEquals(validParameters, expected);
    t.end();
  });
};

module.exports.tests.always_blank = function(test, common) {
  const alwaysBlankSanitizer = require( '../../../sanitizer/_categories')(true);
  test('garbage category', function(t) {
    const req = {
      query: {
        categories: 'barf'
      },
      clean: { }
    };
    const expected_messages = { errors: [], warnings: [
      'Categories filtering not supported on this endpoint, showing results from all categories.'
    ] };

    const messages = alwaysBlankSanitizer.sanitize(req.query, req.clean);

    t.deepEqual(messages, expected_messages, 'error with message returned');
    t.deepEqual(req.clean.categories, [], 'should return empty array');
    t.end();
  });

  test('all garbage categories', function(t) {
    const req = {
      query: {
        categories: 'food'
      },
      clean: { }
    };
    const expected_messages = { errors: [], warnings: [
      'Categories filtering not supported on this endpoint, showing results from all categories.'
    ] };

    const messages = alwaysBlankSanitizer.sanitize(req.query, req.clean);

    t.deepEqual(messages, expected_messages, 'error with message returned');
    t.deepEqual(req.clean.categories, [], 'should return empty array');
    t.end();
  });

  test('defined categories', function(t) {
    const req = {
      query: {
        categories: undefined
      },
      clean: { }
    };
    const expected_messages = { errors: [], warnings: [] };

    const messages = alwaysBlankSanitizer.sanitize(req.query, req.clean);

    t.deepEqual(messages, expected_messages, 'error with message returned');
    t.deepEqual(req.clean.categories, [], 'should return empty array');
    t.end();
  });

  test('empty categories', function(t) {
    const req = {
      query: {
        categories: ''
      },
      clean: { }
    };
    const expected_messages = { errors: [], warnings: [] };

    const messages = alwaysBlankSanitizer.sanitize(req.query, req.clean);

    t.deepEqual(messages, expected_messages, 'error with message returned');
    t.deepEqual(req.clean.categories, [], 'should return empty array');
    t.end();
  });

  test('not defined categories', function(t) {
    const req = {
      query: { },
      clean: { }
    };
    const expected_messages = { errors: [], warnings: [] };

    const messages = alwaysBlankSanitizer.sanitize(req.query, req.clean);

    t.deepEqual(messages, expected_messages, 'error with message returned');
    t.deepEqual(req.clean.categories, undefined, 'categories should be undefined');
    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('SANITIZE _categories ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
