var categories_sanitiser = require('../../../sanitiser/_categories');

module.exports.tests = {};

module.exports.tests.non_category_input = function(test, common) {
  test('empty object', function(t) {
    var input = {};
    var result = categories_sanitiser(input);

    t.deepEqual(result, {error: false}, 'no error returned');
    t.deepEqual(input.clean.categories, [], 'empty array set for categories');
    t.end();
  });

  test('empty categories', function(t) {
    var input = { query: {categories: '' }};
    var result = categories_sanitiser(input);

    t.deepEqual(result, {error: false}, 'no error returned');
    t.deepEqual(input.clean.categories, [], 'empty array set for categories');
    t.end();
  });

  test('blank categories', function(t) {
    var input = { query: {categories: ',,' }};
    var result = categories_sanitiser(input);

    t.deepEqual(result, {error: false}, 'no error returned');
    t.deepEqual(input.clean.categories, [], 'empty array set for categories');
    t.end();
  });
};

module.exports.tests.category_input = function(test, common) {
  test('camel-cased categories', function(t) {
    var input = { query: {categories: 'aB,fooBar,PizzaPlace' }};
    var result = categories_sanitiser(input);

    t.deepEqual(result, {error: false}, 'no error returned');
    t.deepEqual(input.clean.categories, ['ab', 'foobar', 'pizzaplace'], 'lowercased categories returned');
    t.end();
  });

  test('whitespace categories', function(t) {
    var input = { query: {categories: '  aB, fooBar ,PizzaPlace   ' }};
    var result = categories_sanitiser(input);

    t.deepEqual(result, {error: false}, 'no error returned');
    t.deepEqual(input.clean.categories, ['ab', 'foobar', 'pizzaplace'], 'trimmed categories returned');
    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('SANTIZE categories ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
