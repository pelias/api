var sanitizer = require('../../../sanitizer/_tokenizer')();

module.exports.tests = {};

module.exports.tests.sanity_checks = function(test, common) {
  test('clean.text not set', function(t) {

    var clean = {}; // clean.text not set
    var messages = sanitizer.sanitize({}, clean);

    // no tokens produced
    t.deepEquals(clean.tokens, [], 'no tokens');
    t.deepEquals(clean.tokens_complete, [], 'no tokens');
    t.deepEquals(clean.tokens_incomplete, [], 'no tokens');

    // no errors/warnings produced
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');

    t.end();
  });
  test('clean.text not a string', function(t) {

    var clean = { text: {} }; // clean.text not a string
    var messages = sanitizer.sanitize({}, clean);

    // no tokens produced
    t.deepEquals(clean.tokens, [], 'no tokens');
    t.deepEquals(clean.tokens_complete, [], 'no tokens');
    t.deepEquals(clean.tokens_incomplete, [], 'no tokens');

    // no errors/warnings produced
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');

    t.end();
  });
  test('empty string', function(t) {

    var clean = { text: '' };
    var messages = sanitizer.sanitize({}, clean);

    // no tokens produced
    t.deepEquals(clean.tokens, [], 'no tokens');
    t.deepEquals(clean.tokens_complete, [], 'no tokens');
    t.deepEquals(clean.tokens_incomplete, [], 'no tokens');

    // no errors/warnings produced
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');

    t.end();
  });
  test('clean.parsed_text set but clean.parsed_text.name invalid', function(t) {

    var clean = { parsed_text: { text: {} } };
    var messages = sanitizer.sanitize({}, clean);

    // no tokens produced
    t.deepEquals(clean.tokens, [], 'no tokens');
    t.deepEquals(clean.tokens_complete, [], 'no tokens');
    t.deepEquals(clean.tokens_incomplete, [], 'no tokens');

    // no errors/warnings produced
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');

    t.end();
  });
  test('favor clean.parsed_text.name over clean.text', function(t) {

    var clean = { parsed_text: { name: 'foo' }, text: 'bar' };
    var messages = sanitizer.sanitize({}, clean);

    // favor clean.parsed_text.name over clean.text
    t.deepEquals(clean.tokens, [ 'foo' ], 'use clean.parsed_text.name');
    t.deepEquals(clean.tokens_complete, [ 'foo' ], 'use clean.parsed_text.name');
    t.deepEquals(clean.tokens_incomplete, [], 'no tokens');

    // no errors/warnings produced
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');

    t.end();
  });
  test('favor clean.parsed_text street data over clean.text', function(t) {

    var clean = { parsed_text: { number: '190', street: 'foo st' }, text: 'bar' };
    var messages = sanitizer.sanitize({}, clean);

    // favor clean.parsed_text.name over clean.text
    t.deepEquals(clean.tokens, [ '190', 'foo', 'st' ], 'use street name + number');
    t.deepEquals(clean.tokens_complete, [ '190', 'foo', 'st' ], 'use street name + number');
    t.deepEquals(clean.tokens_incomplete, [], 'no tokens');

    // no errors/warnings produced
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');

    t.end();
  });
  test('favor clean.parsed_text.name over clean.parsed_text street data', function(t) {

    var clean = { parsed_text: { number: '190', street: 'foo st', name: 'foo' }, text: 'bar' };
    var messages = sanitizer.sanitize({}, clean);

    // favor clean.parsed_text.name over all other variables
    t.deepEquals(clean.tokens, [ 'foo' ], 'use clean.parsed_text.name');
    t.deepEquals(clean.tokens_complete, [ 'foo' ], 'use clean.parsed_text.name');
    t.deepEquals(clean.tokens_incomplete, [], 'no tokens');

    // no errors/warnings produced
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');

    t.end();
  });
};

module.exports.tests.space_delimiter = function(test, common) {
  test('space delimiter - simple', function(t) {

    var clean = { text: '30 west 26th street new york' };
    var messages = sanitizer.sanitize({}, clean);

    // tokens produced
    t.deepEquals(clean.tokens, [
      '30',
      'west',
      '26th',
      'street',
      'new',
      'york'
    ], 'tokens produced');

    // all but last token marked as 'complete'
    t.deepEquals(clean.tokens_complete, [
      '30',
      'west',
      '26th',
      'street',
      'new'
    ], 'tokens produced');

    // last token marked as 'incomplete'
    t.deepEquals(clean.tokens_incomplete, [
      'york'
    ], 'tokens produced');

    // no errors/warnings produced
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');

    t.end();
  });
  test('space delimiter - multiple spaces / other whitespace', function(t) {

    var clean = { text: ' 30  west \t26th \nstreet   new york ' };
    var messages = sanitizer.sanitize({}, clean);

    // tokens produced
    t.deepEquals(clean.tokens, [
      '30',
      'west',
      '26th',
      'street',
      'new',
      'york'
    ], 'tokens produced');

    // all but last token marked as 'complete'
    t.deepEquals(clean.tokens_complete, [
      '30',
      'west',
      '26th',
      'street',
      'new'
    ], 'tokens produced');

    // last token marked as 'incomplete'
    t.deepEquals(clean.tokens_incomplete, [
      'york'
    ], 'tokens produced');

    // no errors/warnings produced
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');

    t.end();
  });
};

module.exports.tests.comma_delimiter = function(test, common) {
  test('comma delimiter - simple', function(t) {

    var clean = { text: '30 west 26th street, new york' };
    var messages = sanitizer.sanitize({}, clean);

    // tokens produced
    t.deepEquals(clean.tokens, [
      '30',
      'west',
      '26th',
      'street',
      'new',
      'york'
    ], 'tokens produced');

    // all but last token marked as 'complete'
    t.deepEquals(clean.tokens_complete, [
      '30',
      'west',
      '26th',
      'street',
      'new'
    ], 'tokens produced');

    // last token marked as 'incomplete'
    t.deepEquals(clean.tokens_incomplete, [
      'york'
    ], 'tokens produced');

    // no errors/warnings produced
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');

    t.end();
  });
  test('comma delimiter - multiple commas', function(t) {

    var clean = { text: ',30 west 26th street,,, new york,' };
    var messages = sanitizer.sanitize({}, clean);

    // tokens produced
    t.deepEquals(clean.tokens, [
      '30',
      'west',
      '26th',
      'street',
      'new',
      'york'
    ], 'tokens produced');

    // all but last token marked as 'complete'
    t.deepEquals(clean.tokens_complete, [
      '30',
      'west',
      '26th',
      'street',
      'new'
    ], 'tokens produced');

    // last token marked as 'incomplete'
    t.deepEquals(clean.tokens_incomplete, [
      'york'
    ], 'tokens produced');

    // no errors/warnings produced
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');

    t.end();
  });
};

module.exports.tests.forward_slash_delimiter = function(test, common) {
  test('forward slash delimiter - simple', function(t) {

    var clean = { text: 'Bedell Street/133rd Avenue' };
    var messages = sanitizer.sanitize({}, clean);

    // tokens produced
    t.deepEquals(clean.tokens, [
      'Bedell',
      'Street',
      '133rd',
      'Avenue'
    ], 'tokens produced');

    // all but last token marked as 'complete'
    t.deepEquals(clean.tokens_complete, [
      'Bedell',
      'Street',
      '133rd'
    ], 'tokens produced');

    // last token marked as 'incomplete'
    t.deepEquals(clean.tokens_incomplete, [
      'Avenue'
    ], 'tokens produced');

    // no errors/warnings produced
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');

    t.end();
  });
  test('forward slash - multiple slashes', function(t) {

    var clean = { text: '/Bedell Street//133rd Avenue/' };
    var messages = sanitizer.sanitize({}, clean);

    // tokens produced
    t.deepEquals(clean.tokens, [
      'Bedell',
      'Street',
      '133rd',
      'Avenue'
    ], 'tokens produced');

    // all but last token marked as 'complete'
    t.deepEquals(clean.tokens_complete, [
      'Bedell',
      'Street',
      '133rd'
    ], 'tokens produced');

    // last token marked as 'incomplete'
    t.deepEquals(clean.tokens_incomplete, [
      'Avenue'
    ], 'tokens produced');

    // no errors/warnings produced
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');

    t.end();
  });
};

module.exports.tests.final_token_single_gram = function(test, common) {
  test('final token single gram - numeric', function(t) {

    var clean = { text: 'grolmanstrasse 1' };
    var messages = sanitizer.sanitize({}, clean);

    // tokens produced
    t.deepEquals(clean.tokens, [
      'grolmanstrasse',
      '1'
    ], 'tokens produced');

    // all but last token marked as 'complete'
    t.deepEquals(clean.tokens_complete, [
      'grolmanstrasse',
    ], 'tokens produced');

    // last token marked as 'incomplete'
    t.deepEquals(clean.tokens_incomplete, [
      '1'
    ], 'tokens produced');

    // no errors/warnings produced
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');

    t.end();
  });
  test('final token single gram - non-numeric', function(t) {

    var clean = { text: 'grolmanstrasse a' };
    var messages = sanitizer.sanitize({}, clean);

    // tokens produced
    t.deepEquals(clean.tokens, [
      'grolmanstrasse',
      'a'
    ], 'tokens produced');

    // all but last token marked as 'complete'
    t.deepEquals(clean.tokens_complete, [
      'grolmanstrasse',
    ], 'tokens produced');

    // last token marked as 'incomplete'
    t.deepEquals(clean.tokens_incomplete, [
      'a'
    ], 'tokens produced');

    // no errors/warnings produced
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');

    t.end();
  });
};

module.exports.tests.back_slash_delimiter = function(test, common) {
  test('back slash delimiter - simple', function(t) {

    var clean = { text: 'Bedell Street\\133rd Avenue' };
    var messages = sanitizer.sanitize({}, clean);

    // tokens produced
    t.deepEquals(clean.tokens, [
      'Bedell',
      'Street',
      '133rd',
      'Avenue'
    ], 'tokens produced');

    // no errors/warnings produced
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');

    t.end();
  });
  test('back slash - multiple slashes', function(t) {

    var clean = { text: '\\Bedell Street\\\\133rd Avenue\\' };
    var messages = sanitizer.sanitize({}, clean);

    // tokens produced
    t.deepEquals(clean.tokens, [
      'Bedell',
      'Street',
      '133rd',
      'Avenue'
    ], 'tokens produced');

    // no errors/warnings produced
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');

    t.end();
  });
};

module.exports.tests.mixed_delimiter = function(test, common) {
  test('mixed delimiters', function(t) {

    var clean = { text: ',/Bedell Street\\, \n\t ,\\//133rd Avenue, /\n/' };
    var messages = sanitizer.sanitize({}, clean);

    // tokens produced
    t.deepEquals(clean.tokens, [
      'Bedell',
      'Street',
      '133rd',
      'Avenue'
    ], 'tokens produced');

    // no errors/warnings produced
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');

    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('sanitizeR _tokenizer: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
