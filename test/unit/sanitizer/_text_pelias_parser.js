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
    subject: '123 main',
    street: 'main',
    housenumber: '123'
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

  // university
  cases.push(['Union College, Kentucky', {
    subject: 'Union College',
    venue: 'Union College',
    region: 'Kentucky',
    admin: 'Kentucky'
  }]);

  // street (USA style)
  cases.push(['M', { subject: 'M' }, true]);
  cases.push(['Ma', { subject: 'Ma' }, true]);
  cases.push(['Mai', { subject: 'Mai' }, true]);
  cases.push(['Main', { subject: 'Main' }, true]);
  cases.push(['Main ', { subject: 'Main' }, true]);
  cases.push(['Main S', { subject: 'Main S' }, true]);
  cases.push(['Main St', { subject: 'Main St' }, true]);
  cases.push(['Main St S', { subject: 'Main St' }, true]);
  // cases.push(['Main St Se', { subject: 'Main St' }, true]); // jitter on SE
  cases.push(['Main St Sea', { subject: 'Main St' }, true]);
  cases.push(['Main St Seat', { subject: 'Main St' }, true]);
  cases.push(['Main St Seatt', { subject: 'Main St' }, true]);
  cases.push(['Main St Seattl', { subject: 'Main St' }, true]);
  cases.push(['Main St Seattle', { subject: 'Main St' }, true]);

  // address (USA style)
  cases.push(['1', { subject: '1' }, true]);
  cases.push(['10', { subject: '10' }, true]);
  cases.push(['10 ', { subject: '10' }, true]);
  cases.push(['10 M', { subject: '10 M' }, true]);
  cases.push(['10 Ma', { subject: '10 Ma' }, true]);
  cases.push(['10 Mai', { subject: '10 Mai' }, true]);
  cases.push(['10 Main', { subject: '10 Main' }, true]);
  cases.push(['10 Main ', { subject: '10 Main' }, true]);
  cases.push(['10 Main S', { subject: '10 Main S' }, true]);
  cases.push(['10 Main St', { subject: '10 Main St' }, true]);
  cases.push(['10 Main St S', { subject: '10 Main St' }, true]);
  // cases.push(['10 Main St Se', { subject: '10 Main St' }, true]); // jitter issue
  cases.push(['10 Main St Sea', { subject: '10 Main St' }, true]);
  cases.push(['10 Main St Seat', { subject: '10 Main St' }, true]);
  cases.push(['10 Main St Seatt', { subject: '10 Main St' }, true]);
  cases.push(['10 Main St Seattl', { subject: '10 Main St' }, true]);
  cases.push(['10 Main St Seattle', { subject: '10 Main St' }, true]);

  // street (ESP style)
  cases.push(['C', { subject: 'C' }, true]);
  cases.push(['Ca', { subject: 'Ca' }, true]);
  cases.push(['Cal', { subject: 'Cal' }, true]);
  cases.push(['Call', { subject: 'Call' }, true]);
  cases.push(['Calle', { subject: 'Calle' }, true]);
  cases.push(['Calle ', { subject: 'Calle' }, true]);
  cases.push(['Calle P', { subject: 'Calle P' }, true]);
  cases.push(['Calle Pr', { subject: 'Calle Pr' }, true]);
  cases.push(['Calle Pri', { subject: 'Calle Pri' }, true]);
  cases.push(['Calle Prin', { subject: 'Calle Prin' }, true]);
  cases.push(['Calle Princ', { subject: 'Calle Princ' }, true]);
  cases.push(['Calle Princi', { subject: 'Calle Princi' }, true]);
  cases.push(['Calle Princip', { subject: 'Calle Princip' }, true]);
  cases.push(['Calle Principa', { subject: 'Calle Principa' }, true]);
  cases.push(['Calle Principal', { subject: 'Calle Principal' }, true]);
  cases.push(['Calle Principal ', { subject: 'Calle Principal' }, true]);
  cases.push(['Calle Principal B', { subject: 'Calle Principal' }, true]);
  // cases.push(['Calle Principal Ba', { subject: 'Calle Principal' }, true]); // jitter issue
  // cases.push(['Calle Principal Bar', { subject: 'Calle Principal' }, true]);
  // (0.91) ➜ [ { street: 'Calle Principal Barc' } ] && (0.91) ➜ [ { street: 'Calle Principal' }, { locality: 'Barc' } ]
  // cases.push(['Calle Principal Barc', { subject: 'Calle Principal' }, true]);
  // cases.push(['Calle Principal Barce', { subject: 'Calle Principal' }, true]); // jitter issue
  // cases.push(['Calle Principal Barcel', { subject: 'Calle Principal' }, true]); // jitter issue
  // cases.push(['Calle Principal Barcelo', { subject: 'Calle Principal' }, true]); // jitter issue
  // cases.push(['Calle Principal Barcelon', { subject: 'Calle Principal' }, true]); // jitter issue
  cases.push(['Calle Principal Barcelona', { subject: 'Calle Principal' }, true]);

  // address (ESP style)
  cases.push(['Calle Principal 20', { subject: '20 Calle Principal' }, true]);
  cases.push(['Calle Principal 20', { subject: '20 Calle Principal' }, true]);
  cases.push(['Calle Principal 20 ', { subject: '20 Calle Principal' }, true]);
  cases.push(['Calle Principal 20 B', { subject: '20 Calle Principal' }, true]);
  cases.push(['Calle Principal 20 Ba', { subject: '20 Calle Principal' }, true]);
  cases.push(['Calle Principal 20 Bar', { subject: '20 Calle Principal' }, true]);
  cases.push(['Calle Principal 20 Barc', { subject: '20 Calle Principal' }, true]);
  cases.push(['Calle Principal 20 Barce', { subject: '20 Calle Principal' }, true]);
  cases.push(['Calle Principal 20 Barcel', { subject: '20 Calle Principal' }, true]);
  cases.push(['Calle Principal 20 Barcelo', { subject: '20 Calle Principal' }, true]);
  cases.push(['Calle Principal 20 Barcelon', { subject: '20 Calle Principal' }, true]);
  cases.push(['Calle Principal 20 Barcelona', { subject: '20 Calle Principal' }, true]);

  // street (DEU style)
  cases.push(['H', { subject: 'H' }, true]);
  cases.push(['Ha', { subject: 'Ha' }, true]);
  cases.push(['Hau', { subject: 'Hau' }, true]);
  cases.push(['Haup', { subject: 'Haup' }, true]);
  cases.push(['Haupt', { subject: 'Haupt' }, true]);
  cases.push(['Haupts', { subject: 'Haupts' }, true]);
  cases.push(['Hauptst', { subject: 'Hauptst' }, true]);
  cases.push(['Hauptstr', { subject: 'Hauptstr' }, true]);
  cases.push(['Hauptstra', { subject: 'Hauptstra' }, true]);
  cases.push(['Hauptstraß', { subject: 'Hauptstraß' }, true]);
  cases.push(['Hauptstraße', { subject: 'Hauptstraße' }, true]);
  cases.push(['Hauptstraße ', { subject: 'Hauptstraße' }, true]);
  cases.push(['Hauptstraße B', { subject: 'Hauptstraße' }, true]);
  cases.push(['Hauptstraße Be', { subject: 'Hauptstraße' }, true]);
  cases.push(['Hauptstraße Ber', { subject: 'Hauptstraße' }, true]);
  cases.push(['Hauptstraße Berl', { subject: 'Hauptstraße' }, true]);
  cases.push(['Hauptstraße Berli', { subject: 'Hauptstraße' }, true]);
  cases.push(['Hauptstraße Berlin', { subject: 'Hauptstraße' }, true]);

  // address (DEU style)
  cases.push(['H', { subject: 'H' }, true]);
  cases.push(['Ha', { subject: 'Ha' }, true]);
  cases.push(['Hau', { subject: 'Hau' }, true]);
  cases.push(['Haup', { subject: 'Haup' }, true]);
  cases.push(['Haupt', { subject: 'Haupt' }, true]);
  cases.push(['Haupts', { subject: 'Haupts' }, true]);
  cases.push(['Hauptst', { subject: 'Hauptst' }, true]);
  cases.push(['Hauptstr', { subject: 'Hauptstr' }, true]);
  cases.push(['Hauptstra', { subject: 'Hauptstra' }, true]);
  cases.push(['Hauptstraß', { subject: 'Hauptstraß' }, true]);
  cases.push(['Hauptstraße', { subject: 'Hauptstraße' }, true]);
  cases.push(['Hauptstraße ', { subject: 'Hauptstraße' }, true]);
  cases.push(['Hauptstraße 5', { subject: '5 Hauptstraße' }, true]);
  cases.push(['Hauptstraße 50', { subject: '50 Hauptstraße' }, true]);
  cases.push(['Hauptstraße 50 ', { subject: '50 Hauptstraße' }, true]);
  cases.push(['Hauptstraße 50 B', { subject: '50 Hauptstraße' }, true]);
  cases.push(['Hauptstraße 50 Be', { subject: '50 Hauptstraße' }, true]);
  cases.push(['Hauptstraße 50 Ber', { subject: '50 Hauptstraße' }, true]);
  cases.push(['Hauptstraße 50 Berl', { subject: '50 Hauptstraße' }, true]);
  cases.push(['Hauptstraße 50 Berli', { subject: '50 Hauptstraße' }, true]);
  cases.push(['Hauptstraße 50 Berlin', { subject: '50 Hauptstraße' }, true]);

  // venues
  cases.push(['K', { subject: 'K' }, true]);
  cases.push(['Ka', { subject: 'Ka' }, true]);
  cases.push(['Kas', { subject: 'Kas' }, true]);
  cases.push(['Kasc', { subject: 'Kasc' }, true]);
  cases.push(['Kasch', { subject: 'Kasch' }, true]);
  cases.push(['Kaschk', { subject: 'Kaschk' }, true]);
  cases.push(['Kaschk ', { subject: 'Kaschk' }, true]);
  // cases.push(['Kaschk B', { subject: 'Kaschk' }, true]); // jitter issue
  cases.push(['Kaschk Be', { subject: 'Kaschk' }, true]);
  // cases.push(['Kaschk Ber', { subject: 'Kaschk' }, true]); // jitter issue
  // cases.push(['Kaschk Berl', { subject: 'Kaschk' }, true]); // jitter issue
  // cases.push(['Kaschk Berli', { subject: 'Kaschk' }, true]); // jitter issue
  cases.push(['Kaschk Berlin', { subject: 'Kaschk' }, true]);

  cases.push(['A', { subject: 'A' }, true]);
  cases.push(['Ai', { subject: 'Ai' }, true]);
  cases.push(['Air', { subject: 'Air' }, true]);
  cases.push(['Air ', { subject: 'Air' }, true]);
  cases.push(['Air &', { subject: 'Air &' }, true]);
  cases.push(['Air & ', { subject: 'Air &' }, true]);
  cases.push(['Air & S', { subject: 'Air & S' }, true]);
  cases.push(['Air & Sp', { subject: 'Air & Sp' }, true]);
  cases.push(['Air & Spa', { subject: 'Air & Spa' }, true]);
  cases.push(['Air & Spac', { subject: 'Air & Spac' }, true]);
  cases.push(['Air & Space', { subject: 'Air & Space' }, true]);
  cases.push(['Air & Space ', { subject: 'Air & Space' }, true]);
  // cases.push(['Air & Space M', { subject: 'Air & Space M' }, true]); // jitter issue
  // cases.push(['Air & Space Mu', { subject: 'Air & Space Mu' }, true]); // jitter issue
  cases.push(['Air & Space Mus', { subject: 'Air & Space Mus' }, true]);
  // cases.push(['Air & Space Muse', { subject: 'Air & Space Muse' }, true]); // jitter issue
  // cases.push(['Air & Space Museu', { subject: 'Air & Space Museu' }, true]); // jitter issue
  cases.push(['Air & Space Museum', { subject: 'Air & Space Museum' }, true]);
  cases.push(['Air & Space Museum ', { subject: 'Air & Space Museum' }, true]);
  cases.push(['Air & Space Museum D', { subject: 'Air & Space Museum' }, true]);
  cases.push(['Air & Space Museum DC', { subject: 'Air & Space Museum' }, true]);

  // admin areas
  cases.push(['N', { subject: 'N' }, true]);
  cases.push(['Ne', { subject: 'Ne' }, true]);
  cases.push(['New', { subject: 'New' }, true]);
  cases.push(['New ', { subject: 'New' }, true]);
  cases.push(['New Y', { subject: 'New Y' }, true]);
  // cases.push(['New Yo', { subject: 'New Yo' }, true]); // jitter issue
  // cases.push(['New Yor', { subject: 'New Yor' }, true]); // jitter issue
  cases.push(['New York', { subject: 'New York' }, true]);
  cases.push(['New York N', { subject: 'New York' }, true]);
  cases.push(['New York NY', { subject: 'New York' }, true]);
  
  cases.push(['B', { subject: 'B' }, true]);
  cases.push(['Be', { subject: 'Be' }, true]);
  cases.push(['Ber', { subject: 'Ber' }, true]);
  cases.push(['Berl', { subject: 'Berl' }, true]);
  cases.push(['Berli', { subject: 'Berli' }, true]);
  cases.push(['Berlin', { subject: 'Berlin' }, true]);
  cases.push(['Berlin ', { subject: 'Berlin' }, true]);
  cases.push(['Berlin D', { subject: 'Berlin' }, true]);
  cases.push(['Berlin De', { subject: 'Berlin' }, true]);
  cases.push(['Berlin Deu', { subject: 'Berlin' }, true]);
  cases.push(['Berlin Deut', { subject: 'Berlin' }, true]);
  cases.push(['Berlin Deuts', { subject: 'Berlin' }, true]);
  cases.push(['Berlin Deutsc', { subject: 'Berlin' }, true]);
  cases.push(['Berlin Deutsch', { subject: 'Berlin' }, true]);
  cases.push(['Berlin Deutschl', { subject: 'Berlin' }, true]);
  cases.push(['Berlin Deutschla', { subject: 'Berlin' }, true]);
  cases.push(['Berlin Deutschlan', { subject: 'Berlin' }, true]);
  cases.push(['Berlin Deutschland', { subject: 'Berlin' }, true]);

  // postcodes
  cases.push(['2000', { subject: '2000' }, true]);
  cases.push(['Sydney 2000', { subject: '2000' }, true]);
  cases.push(['10010', { subject: '10010' }, true]);
  cases.push(['New York 10010', { subject: '10010' }, true]);
  cases.push(['10437', { subject: '10437' }, true]);
  cases.push(['Berlin 10437', { subject: '10437' }, true]);
  cases.push(['E81DN', { subject: 'E81DN' }, true]);
  cases.push(['London E81DN', { subject: 'E81DN' }, true]);
  cases.push(['e81dn', { subject: 'e81dn' }, true]);
  cases.push(['london e81dn', { subject: 'e81dn' }, true]);
  cases.push(['e8 1dn', { subject: 'e8 1dn' }, true]);
  // cases.push(['london e8 1dn', { subject: 'e8 1dn' }, true]); // issue

  cases.forEach(testcase => {
    let input = testcase[0];
    let expected = testcase[1];
    let subjectOnly = (testcase[2] === true);

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
        if( subjectOnly ){
          t.equals(clean.parsed_text.subject, clone.subject, `${label}: ${text}`);
        } else {
          t.deepEqual(clean.parsed_text, clone, `${label}: ${text}`);
        }
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

  test('should truncate very long text inputs', (t) => {
    const raw = {
      text: `
Sometimes we make the process more complicated than we need to.
We will never make a journey of a thousand miles by fretting about 
how long it will take or how hard it will be.
We make the journey by taking each day step by step and then repeating 
it again and again until we reach our destination.` };
    const clean = {};
    const messages = sanitizer.sanitize(raw, clean);

    t.equals(clean.text.length, 140);
    t.deepEquals(messages.errors, [], 'no errors');
    t.deepEquals(messages.warnings, [`param 'text' truncated to 140 characters`]);
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
