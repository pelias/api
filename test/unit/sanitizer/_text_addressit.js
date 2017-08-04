var sanitizer = require('../../../sanitizer/_text_addressit')();
var type_mapping = require('../../../helper/type_mapping');

module.exports.tests = {};

module.exports.tests.text_parser = function(test, common) {
  test('short input text has admin layers set ', function(t) {
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
    { name: 'soho', admin_parts: 'new york', state: 'NY' },
    { name: '123 main', admin_parts: 'new york', state: 'NY' }
  ];

  usQueries.forEach(function (query) {
    test('naive parsing ' + query, function(t) {
      var raw = {
        text: query.name + ', ' + query.admin_parts
      };
      var clean = {};

      var expected_clean = {
        text: query.name + ', ' + query.admin_parts,
        parser: 'addressit',
        parsed_text: {
          name: query.name,
          regions: [ query.name ],
          admin_parts: query.admin_parts,
          state: query.state
        }
      };

      var messages = sanitizer.sanitize(raw, clean);

      t.deepEqual(messages, { errors: [], warnings: [] } );
      t.deepEqual(clean, expected_clean);
      t.end();

    });

    test('naive parsing ' + query + ' without spaces', function(t) {
      var raw = {
        text: query.name + ',' + query.admin_parts
      };
      var clean = {};

      var expected_clean = {
        text: query.name + ',' + query.admin_parts,
        parser: 'addressit',
        parsed_text: {
          name: query.name,
          regions: [ query.name ],
          admin_parts: query.admin_parts,
          state: query.state
        }
      };

      var messages = sanitizer.sanitize(raw, clean);

      t.deepEqual(messages, { errors: [], warnings: [] } );
      t.deepEqual(clean, expected_clean);
      t.end();

    });

  });

  var nonUSQueries = [
    { name: 'chelsea', admin_parts: 'london' },
  ];

  nonUSQueries.forEach(function (query) {
    test('naive parsing ' + query, function(t) {
      var raw = {
        text: query.name + ', ' + query.admin_parts
      };
      var clean = {};

      var expected_clean = {
        text: query.name + ', ' + query.admin_parts,
        parser: 'addressit',
        parsed_text: {
          name: query.name,
          regions: [ query.name, query.admin_parts ],
          admin_parts: query.admin_parts
        }
      };

      var messages = sanitizer.sanitize(raw, clean);

      t.deepEqual(messages, { errors: [], warnings: [] } );
      t.deepEqual(clean, expected_clean);
      t.end();

    });

    test('naive parsing ' + query + ' without spaces', function(t) {
      var raw = {
        text: query.name + ',' + query.admin_parts
      };
      var clean = {};

      var expected_clean = {
        text: query.name + ',' + query.admin_parts,
        parser: 'addressit',
        parsed_text: {
          name: query.name,
          regions: [ query.name, query.admin_parts ],
          admin_parts: query.admin_parts
        }
      };

      var messages = sanitizer.sanitize(raw, clean);

      t.deepEqual(messages, { errors: [], warnings: [] } );
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
      parser: 'addressit',
      text: 'yugolsavia'
    };

    var messages = sanitizer.sanitize(raw, clean);

    t.deepEqual(messages, { errors: [], warnings: [] } );
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
      parser: 'addressit',
      text: 'small town'
    };

    var messages = sanitizer.sanitize(raw, clean);

    t.deepEqual(messages, { errors: [], warnings: [] } );
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
      parser: 'addressit',
      text: '123 main'
    };

    var messages = sanitizer.sanitize(raw, clean);

    t.deepEqual(messages, { errors: [], warnings: [] } );
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
      parser: 'addressit',
      text: 'main 123'
    };

    var messages = sanitizer.sanitize(raw, clean);

    t.deepEqual(messages, { errors: [], warnings: [] } );
    t.deepEqual(clean, expected_clean);
    t.end();

  });

  test('query with many tokens', function(t) {
    var raw = {
      text: 'main particle new york'
    };
    var clean = {};
    clean.parsed_text = 'this should be removed';

    var expected_clean = {
      text: 'main particle new york',
      parser: 'addressit',
      parsed_text: {
        regions: [ 'main particle' ],
        state: 'NY'
      }
    };

    var messages = sanitizer.sanitize(raw, clean);

    t.deepEqual(messages, { errors: [], warnings: [] } );
    t.deepEqual(clean, expected_clean);
    t.end();

  });

  test('valid address, house number', function(t) {
    var raw = {
      text: '123 main st new york ny'
    };
    var clean = {};

    var expected_clean = {
      text: '123 main st new york ny',
      parser: 'addressit',
      parsed_text: {
        number: '123',
        street: 'main st',
        state: 'NY',
        regions: [ 'new york' ]
      }
    };

    var messages = sanitizer.sanitize(raw, clean);

    t.deepEqual(messages, { errors: [], warnings: [] } );
    t.deepEqual(clean, expected_clean);
    t.end();

  });

  test('valid address, zipcode', function(t) {
    var raw = {
      text: '123 main st new york ny 10010'
    };
    var clean = {};

    var expected_clean = {
      text: '123 main st new york ny 10010',
      parser: 'addressit',
      parsed_text: {
        number: '123',
        street: 'main st',
        state: 'NY',
        postalcode: '10010',
        regions: [ 'new york' ]
      }
    };

    var messages = sanitizer.sanitize(raw, clean);

    t.deepEqual(messages, { errors: [], warnings: [] } );
    t.deepEqual(clean, expected_clean);
    t.end();
  });

  test('valid address with leading 0s in zipcode', function(t) {
    var raw = {
      text: '339 W Main St, Cheshire, 06410'
    };
    var clean = {};

    var expected_clean = {
      text: '339 W Main St, Cheshire, 06410',
      parser: 'addressit',
      parsed_text: {
        name: '339 W Main St',
        number: '339',
        street: 'W Main St',
        postalcode: '06410',
        regions: [ 'Cheshire' ],
        admin_parts: 'Cheshire, 06410'
      }
    };

    var messages = sanitizer.sanitize(raw, clean);

    t.deepEqual(messages, { errors: [], warnings: [] } );
    t.deepEqual(clean, expected_clean);
    t.end();
  });

  test('valid address without spaces after commas', function(t) {
    var raw = {
      text: '339 W Main St,Lancaster,PA'
    };
    var clean = {};

    var expected_clean = {
      text: '339 W Main St,Lancaster,PA',
      parser: 'addressit',
      parsed_text: {
        name: '339 W Main St',
        number: '339',
        street: 'W Main St',
        state: 'PA',
        regions: [ 'Lancaster' ],
        admin_parts: 'Lancaster, PA'
      }
    };

    var messages = sanitizer.sanitize(raw, clean);

    t.deepEqual(messages, { errors: [], warnings: [] } );
    t.deepEqual(clean, expected_clean);
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
    return tape('sanitizeR _text: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
