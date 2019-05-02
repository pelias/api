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

  var usQueries = [
    { name: 'soho', admin_parts: 'new york', region: 'NY' },
    { name: '123 main', admin_parts: 'new york', region: 'NY' }
  ];

  usQueries.forEach(function (query) {
    test('naive parsing ' + query, function (t) {
      var raw = {
        text: query.name + ', ' + query.admin_parts
      };
      var clean = {};

      var expected_clean = {
        text: raw.text.trim(),
        parser: 'pelias',
        parsed_text: {
          name: query.name,
          region: query.admin_parts,
          admin_parts: query.admin_parts
        }
      };

      var messages = sanitizer.sanitize(raw, clean);

      t.deepEqual(messages, { errors: [], warnings: [] });
      t.deepEqual(clean, expected_clean);
      t.end();

    });

    test('naive parsing ' + query + ' without spaces', function (t) {
      var raw = {
        text: query.name + ',' + query.admin_parts
      };
      var clean = {};

      var expected_clean = {
        text: raw.text.trim(),
        parser: 'pelias',
        parsed_text: {
          name: query.name,
          region: query.admin_parts,
          admin_parts: query.admin_parts
        }
      };

      var messages = sanitizer.sanitize(raw, clean);

      t.deepEqual(messages, { errors: [], warnings: [] });
      t.deepEqual(clean, expected_clean);
      t.end();

    });

    test('naive parsing ' + query + ' with leading and trailing junk', function (t) {
      var raw = {
        text: ' , ' + query.name + ',' + query.admin_parts + ' , '
      };
      var clean = {};

      var expected_clean = {
        text: raw.text.trim(),
        parser: 'pelias',
        parsed_text: {
          name: query.name,
          region: query.admin_parts,
          admin_parts: query.admin_parts
        }
      };

      var messages = sanitizer.sanitize(raw, clean);

      t.deepEqual(messages, { errors: [], warnings: [] });
      t.deepEqual(clean, expected_clean);
      t.end();

    });
  });

  var nonUSQueries = [
    { name: 'chelsea', admin_parts: 'london' },
  ];

  nonUSQueries.forEach(function (query) {
    test('naive parsing ' + query, function (t) {
      var raw = {
        text: query.name + ', ' + query.admin_parts
      };
      var clean = {};

      var expected_clean = {
        text: query.name + ', ' + query.admin_parts,
        parser: 'pelias',
        parsed_text: {
          locality: query.name,
          admin_parts: query.name + ', ' + query.admin_parts
        }
      };

      var messages = sanitizer.sanitize(raw, clean);

      t.deepEqual(messages, { errors: [], warnings: [] });
      t.deepEqual(clean, expected_clean);
      t.end();

    });

    test('naive parsing ' + query + ' without spaces', function (t) {
      var raw = {
        text: query.name + ',' + query.admin_parts
      };
      var clean = {};

      var expected_clean = {
        text: query.name + ',' + query.admin_parts,
        parser: 'pelias',
        parsed_text: {
          locality: query.name,
          admin_parts: query.name + ', ' + query.admin_parts
        }
      };

      var messages = sanitizer.sanitize(raw, clean);

      t.deepEqual(messages, { errors: [], warnings: [] });
      t.deepEqual(clean, expected_clean);
      t.end();

    });

  });

  test('query with one token', function (t) {
    var raw = {
      text: 'yugolsavia'
    };
    var clean = {};
    clean.parsed_text = 'this should be removed';

    var expected_clean = {
      parser: 'pelias',
      text: 'yugolsavia',
      parsed_text: {
        name: 'yugolsavia'
      }
    };

    var messages = sanitizer.sanitize(raw, clean);

    t.deepEqual(messages, { errors: [], warnings: [] });
    t.deepEqual(clean, expected_clean);
    t.end();

  });

  test('query with two tokens, no numbers', function (t) {
    var raw = {
      text: 'small town'
    };
    var clean = {};
    clean.parsed_text = 'this should be removed';

    var expected_clean = {
      parser: 'pelias',
      text: 'small town',
      parsed_text: {
        name: 'small town'
      }
    };

    var messages = sanitizer.sanitize(raw, clean);

    t.deepEqual(messages, { errors: [], warnings: [] });
    t.deepEqual(clean, expected_clean);
    t.end();

  });

  test('query with two tokens, number first', function (t) {
    var raw = {
      text: '123 main'
    };
    var clean = {};
    clean.parsed_text = 'this should be removed';

    var expected_clean = {
      parser: 'pelias',
      text: '123 main',
      parsed_text: {
        name: '123 main'
      }
    };

    var messages = sanitizer.sanitize(raw, clean);

    t.deepEqual(messages, { errors: [], warnings: [] });
    t.deepEqual(clean, expected_clean);
    t.end();

  });

  test('query with two tokens, number second', function (t) {
    var raw = {
      text: 'main 123'
    };
    var clean = {};
    clean.parsed_text = 'this should be removed';

    var expected_clean = {
      parser: 'pelias',
      text: 'main 123',
      parsed_text: {
        name: 'main 123'
      }
    };

    var messages = sanitizer.sanitize(raw, clean);

    t.deepEqual(messages, { errors: [], warnings: [] });
    t.deepEqual(clean, expected_clean);
    t.end();

  });

  test('query with many tokens', function (t) {
    var raw = {
      text: 'main particle new york'
    };
    var clean = {};
    clean.parsed_text = 'this should be removed';

    var expected_clean = {
      text: 'main particle new york',
      parser: 'pelias',
      parsed_text: {
        name: 'main particle',
        region: 'new york',
        admin_parts: 'new york'
      }
    };

    var messages = sanitizer.sanitize(raw, clean);

    t.deepEqual(messages, { errors: [], warnings: [] });
    t.deepEqual(clean, expected_clean);
    t.end();

  });

  test('valid address, house number', function (t) {
    var raw = {
      text: '123 main st new york ny'
    };
    var clean = {};

    var expected_clean = {
      text: '123 main st new york ny',
      parser: 'pelias',
      parsed_text: {
        housenumber: '123',
        street: 'main st',
        region: 'new york',
        locality: 'ny',
        admin_parts: 'new york ny'
      }
    };

    var messages = sanitizer.sanitize(raw, clean);

    t.deepEqual(messages, { errors: [], warnings: [] });
    t.deepEqual(clean, expected_clean);
    t.end();

  });

  test('valid address, zipcode', function (t) {
    var raw = {
      text: '123 main st new york ny 10010'
    };
    var clean = {};

    var expected_clean = {
      text: '123 main st new york ny 10010',
      parser: 'pelias',
      parsed_text: {
        housenumber: '123',
        street: 'main st',
        region: 'new york',
        locality: 'ny',
        postcode: '10010',
        admin_parts: 'new york ny'
      }
    };

    var messages = sanitizer.sanitize(raw, clean);

    t.deepEqual(messages, { errors: [], warnings: [] });
    t.deepEqual(clean, expected_clean);
    t.end();
  });

  test('valid address with leading 0s in zipcode', function (t) {
    var raw = {
      text: '339 W Main St, Cheshire, 06410'
    };
    var clean = {};

    var expected_clean = {
      text: '339 W Main St, Cheshire, 06410',
      parser: 'pelias',
      parsed_text: {
        housenumber: '339',
        street: 'W Main St',
        postcode: '06410',
        region: 'Cheshire',
        admin_parts: 'Cheshire'
      }
    };

    var messages = sanitizer.sanitize(raw, clean);

    t.deepEqual(messages, { errors: [], warnings: [] });
    t.deepEqual(clean, expected_clean);
    t.end();
  });

  test('valid address without spaces after commas', function (t) {
    var raw = {
      text: '339 W Main St,Lancaster,PA'
    };
    var clean = {};

    var expected_clean = {
      text: '339 W Main St,Lancaster,PA',
      parser: 'pelias',
      parsed_text: {
        housenumber: '339',
        street: 'W Main St',
        locality: 'Lancaster',
        region: 'PA',
        admin_parts: 'Lancaster, PA'
      }
    };

    var messages = sanitizer.sanitize(raw, clean);

    t.deepEqual(messages, { errors: [], warnings: [] });
    t.deepEqual(clean, expected_clean);
    t.end();

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

  test('Australia - state only', (t) => {
    const raw = { text: 'NSW' };
    const clean = {};
    const expected_clean = { text: 'NSW', parser: 'pelias', parsed_text: {
      region: 'NSW',
      admin_parts: 'NSW'
    }};
    const messages = sanitizer.sanitize(raw, clean);

    t.deepEquals(clean, expected_clean);
    t.deepEquals(messages.errors, []);
    t.deepEquals(messages.warnings, [], 'no warnings');
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
