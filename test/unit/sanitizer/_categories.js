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

    var expected_error = 'Categories parameter cannot be left blank. See documentation of service for valid options.';

    var messages = sanitizer.sanitize(req.query, req.clean);

    t.equal(req.clean.categories, undefined, 'no categories should be defined');
    t.deepEqual(messages.errors.length, 1, 'error returned');
    t.deepEqual(messages.errors[0], expected_error, 'error returned');
    t.deepEqual(messages.warnings, [], 'no warnings returned');
    t.end();
  });

  test('categories is an array of empty strings', function(t) {
    var req = {
      query: {
        categories: ',,'
      },
      clean: { }
    };

    var expected_error = 'Invalid categories parameter value(s). See documentation of service for valid options.';

    var messages = sanitizer.sanitize(req.query, req.clean);

    t.equal(req.clean.categories, undefined, 'no categories should be defined');
    t.deepEqual(messages.errors.length, 1, 'error returned');
    t.deepEqual(messages.errors[0], expected_error, 'error returned');
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
      errors: [
        'Invalid categories parameter value(s). See documentation of service for valid options.'
      ],
      warnings: []
    };

    var messages = sanitizer.sanitize(req.query, req.clean, validCategories);

    t.deepEqual(messages, expected_messages, 'error with message returned');
    t.equal(req.clean.categories, undefined, 'clean.categories should remain empty');
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
      errors: [
        'Invalid categories parameter value(s). See documentation of service for valid options.'
      ],
      warnings: []
    };

    var messages = sanitizer.sanitize(req.query, req.clean, validCategories);

    t.deepEqual(messages, expected_messages, 'error with message returned');
    t.equal(req.clean.categories, undefined, 'clean.categories should remain empty');
    t.end();
  });

  test('return an array of expected parameters in object form for validation', (t) => {
    const expected = [{ name: 'categories' }];

    const validParameters = sanitizer.expected();

    t.deepEquals(validParameters, expected);
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
