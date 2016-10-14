var type_mapping = require('../../../helper/type_mapping');
var proxyquire =  require('proxyquire').noCallThru();

module.exports.tests = {};

module.exports.tests.text_parser = function(test, common) {
  test('non-empty raw.text should call analyzer and set clean.text and clean.parsed_text', function(t) {
    var mock_analyzer_response = {
      key1: 'value 1',
      key2: 'value 2'
    };

    var sanitizer = proxyquire('../../../sanitizer/_text', {
      'pelias-text-analyzer': { parse: function(query) {
        return mock_analyzer_response;
      }
    }});

    var raw = {
      text: 'raw input'
    };
    var clean = {
    };

    var expected_clean = {
      text: raw.text,
      parsed_text: mock_analyzer_response
    };

    var messages = sanitizer(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');
    t.end();

  });

  test('empty raw.text should add error message', function(t) {
    var sanitizer = proxyquire('../../../sanitizer/_text', {
      'pelias-text-analyzer': { parse: function(query) {
        throw new Error('analyzer should not have been called');
      }
    }});

    var raw = {
      text: ''
    };
    var clean = {
    };

    var expected_clean = {
    };

    var messages = sanitizer(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEquals(messages.errors, ['invalid param \'text\': text length, must be >0'], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');
    t.end();

  });

  test('undefined raw.text should add error message', function(t) {
    var sanitizer = proxyquire('../../../sanitizer/_text', {
      'pelias-text-analyzer': { parse: function(query) {
        throw new Error('analyzer should not have been called');
      }
    }});

    var raw = {
      text: undefined
    };
    var clean = {
    };

    var expected_clean = {
    };

    var messages = sanitizer(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEquals(messages.errors, ['invalid param \'text\': text length, must be >0'], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');
    t.end();

  });

  test('text_analyzer.parse returning undefined should not overwrite clean.parsed_text', function(t) {
    var sanitizer = proxyquire('../../../sanitizer/_text', {
      'pelias-text-analyzer': { parse: function(query) {
        return undefined;
      }
    }});

    var raw = {
      text: 'raw input'
    };
    var clean = {
      parsed_text: 'original clean.parsed_text'
    };

    var expected_clean = {
      text: raw.text,
      parsed_text: 'original clean.parsed_text'
    };

    var messages = sanitizer(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');
    t.end();

  });

  test('text_analyzer.parse returning null should not overwrite clean.parsed_text', function(t) {
    var sanitizer = proxyquire('../../../sanitizer/_text', {
      'pelias-text-analyzer': { parse: function(query) {
        return null;
      }
    }});

    var raw = {
      text: 'raw input'
    };
    var clean = {
      parsed_text: 'original clean.parsed_text'
    };

    var expected_clean = {
      text: raw.text,
      parsed_text: 'original clean.parsed_text'
    };

    var messages = sanitizer(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');
    t.end();

  });

};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('sanitizeR _text: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
