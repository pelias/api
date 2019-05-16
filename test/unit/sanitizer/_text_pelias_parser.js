var sanitizer = require('../../../sanitizer/_text_pelias_parser')();
var type_mapping = require('../../../helper/type_mapping');

module.exports.tests = {};

module.exports.tests.text_parser = function (test, common) {
  test('short input text has admin layers set ', function (t) {
    var raw = {
      text: 'emp'  //start of empire state building
    };
    var clean = {
    };

    var messages = sanitizer.sanitize(raw, clean);

    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [], 'no warnings');

    t.end();
  });

  let cases = [];
  
  // USA queries
  cases.push(['soho, new york, NY', {
    subject: 'soho',
    locality: 'new york',
    region: 'NY',
    admin: 'new york, NY'
  }]);

  cases.push(['123 main st, new york, NY', {
    subject: '123 main st',
    housenumber: '123',
    street: 'main st',
    locality: 'new york',
    region: 'NY',
    admin: 'new york, NY'
  }]);

  // GBR queries
  cases.push(['chelsea, london', {
    subject: 'chelsea',
    locality: 'chelsea',
    admin: 'london'
  }]);

  // Query with one token
  cases.push(['yugolsavia', {
    subject: 'yugolsavia'
  }]);

  // Query with two tokens, no numbers
  cases.push(['small town', {
    subject: 'small town'
  }]);

  // Query with two tokens, number first
  cases.push(['123 main', {
    subject: '123 main'
  }]);

  // Query with two tokens, number second
  cases.push(['main 123', {
    subject: 'main 123'
  }]);

  // Query with many tokens
  cases.push(['main particle new york', {
    subject: 'main particle',
    locality: 'new york',
    admin: 'new york'
  }]);

  // Valid address with housenumber
  cases.push(['123 main st new york ny', {
    subject: '123 main st',
    housenumber: '123',
    street: 'main st',
    locality: 'new york',
    region: 'ny',
    admin: 'new york ny'
  }]);

  // Valid address with postcode
  cases.push(['123 main st new york ny 10010', {
    subject: '123 main st',
    housenumber: '123',
    street: 'main st',
    locality: 'new york',
    region: 'ny',
    postcode: '10010',
    admin: 'new york ny'
  }]);

  // Valid address with leading 0 in postcode
  cases.push(['339 W Main St, Cheshire, 06410', {
    subject: '339 W Main St',
    housenumber: '339',
    street: 'W Main St',
    locality: 'Cheshire',
    postcode: '06410',
    admin: 'Cheshire'
  }]);

  // Valid address with no spaces after comma
  cases.push(['339 W Main St,Lancaster,PA', {
    subject: '339 W Main St',
    housenumber: '339',
    street: 'W Main St',
    locality: 'Lancaster',
    region: 'PA',
    admin: 'Lancaster, PA'
  }]);

  // Valid address without commas
  cases.push(['123 main st new york ny', {
    subject: '123 main st',
    housenumber: '123',
    street: 'main st',
    locality: 'new york',
    region: 'ny',
    admin: 'new york ny'
  }]);

  // AUS - state only
  cases.push(['NSW', {
    subject: 'NSW',
    region: 'NSW'
  }]);

  // when admin name is $subject it should
  // be removed from $admin
  cases.push(['paris texas', {
    subject: 'paris',
    locality: 'paris',
    region: 'texas',
    admin: 'texas'
  }]);
  cases.push(['rome italy', {
    subject: 'rome',
    locality: 'rome',
    country: 'italy',
    admin: 'italy'
  }]);

  cases.forEach(testcase => {
    let input = testcase[0];
    let expected = testcase[1];

    function assert(label, replacement, replaceAdmin) {
      let text = input.replace(/\s+/, ' ');
      let clone = Object.assign({}, expected);
      if (Array.isArray(replacement) && replacement.length === 2) {
        text = text.replace(replacement[0], replacement[1]);
        if (replaceAdmin === true && clone.admin) {
          clone.admin = clone.admin.replace(replacement[0], replacement[1]).trim();
        }
      }
      if (clone.admin) {
        clone.admin = clone.admin.replace(/\s+/g, ' ').trim();
      }
      test(`${label}: ${text}`, t => {
        let raw = { text: text };
        let clean = { parsed_text: 'this should be removed' };
        let messages = sanitizer.sanitize(raw, clean);

        t.deepEqual(messages, { errors: [], warnings: [] }, 'messages');
        t.equal(clean.text, raw.text.trim(), 'text');
        t.equal(clean.parser, 'pelias', 'parser');
        t.deepEqual(clean.parsed_text, clone, `${label}: ${text}`);
        t.end();
      });
    }

    assert('literal');
    assert('no commas', [/,/g, ' '], true);
    assert('no space after comma', [/,\s+/g, ',']);
    assert('leading and trailing junk', [/^(.+)$/g, ' , $1 , ']);
  });

  test('whitespace-only input counts as empty', (t) => {
    const raw = { text: ' ' };
    const clean = {};

    const expected_clean = {};

    const messages = sanitizer.sanitize(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEquals(messages.errors, ['invalid param \'text\': text length, must be >0']);
    t.deepEquals(messages.warnings, [], 'no warnings');
    t.end();
  });

  test('return an array of expected parameters in object form for validation', (t) => {
    const expected = [{ name: 'text' }];
    const validParameters = sanitizer.expected();
    t.deepEquals(validParameters, expected);
    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('sanitizer _text: ' + name, testFunction);
  }

  for (var testCase in module.exports.tests) {
    module.exports.tests[testCase](test, common);
  }
};
