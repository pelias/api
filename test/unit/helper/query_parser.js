
var parser = require('../../../helper/query_parser');
var get_layers = require('../../../helper/layers');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('interface', function(t) {
    t.equal(typeof parser, 'function', 'valid function');
    t.end();
  });
};

module.exports.tests.split_on_comma = function(test, common) {
  var queries = ['soho, new york', 'chelsea, london', '123 main, new york'];
  var delim   = ',';

  var testParse = function(query) {
    test('naive parsing ' + query, function(t) {
      var address = parser(query);
      var delimIndex = query.indexOf(delim);
      var name = query.substring(0, delimIndex);
      var admin_parts = query.substring(delimIndex + 1).trim();

      t.equal(typeof address, 'object', 'valid object');
      t.equal(address.name, name, 'name set correctly to ' + address.name);
      t.equal(address.admin_parts, admin_parts, 'admin_parts set correctly to ' + address.admin_parts);
      t.end();
    });
  };

  for (var key in queries) {
    testParse( queries[key] );
  }
};

module.exports.tests.parse_three_chars_or_less = function(test, common) {
  var chars_queries = ['a', 'bb', 'ccc'];
  var num_queries   = ['1', '12', '123'];
  var alphanum_q    = ['a1', '1a2', '12c'];

  var testParse = function(query) {
    test('query length < 3 (' + query + ')', function(t) {
      var address = parser(query);
      var target_layer = get_layers(['admin']);

      t.equal(typeof address, 'object', 'valid object');
      t.deepEqual(address.target_layer, target_layer, 'admin_parts set correctly to ' + target_layer.join(', '));
      t.end();
    });
  };

  var queries = chars_queries.concat(num_queries).concat(alphanum_q);
  for (var key in queries) {
    testParse( queries[key] );
  }
};

module.exports.tests.parse_one_or_more_tokens = function(test, common) {
  var one_token_queries = ['hyderbad', 'yugoslavia', 'somethingreallybigbutjustonetokenstill'];
  var two_tokens_nonum  = ['small town', 'biggg city', 'another empire'];
  var two_tokens_withnum= ['123 main', 'sixty 1', '123-980 house'];

  var testParse = function(query, parse_address) {
    test('query with one or more tokens (' + query + ')', function(t) {
      var address = parser(query);
      var target_layer = get_layers(['admin', 'poi']);

      t.equal(typeof address, 'object', 'valid object');

      if (parse_address) {
        t.deepEqual(address.regions.join(''), query, 'since query contained a number, it went through address parsing');
      } else {
        t.deepEqual(address.target_layer, target_layer, 'admin_parts set correctly to ' + target_layer.join(', '));
      }

      t.end();
    });
  };

  var queries = one_token_queries.concat(two_tokens_nonum);
  for (var key in queries) {
    testParse( queries[key] );
  }
  for (key in two_tokens_withnum) {
    testParse( two_tokens_withnum[key], true );
  }
};

module.exports.tests.parse_address = function(test, common) {
  var addresses_nonum  = [{ non_street: 'main particle', city: 'new york'},
                          { non_street: 'biggg city block' },
                          { non_street: 'the empire state building' }
                         ];
  var address_with_num = [{ number: 123, street: 'main st', city: 'new york', state: 'ny'},
                          { number: 456, street: 'pine ave', city: 'san francisco', state: 'CA'},
                          { number: 1980, street: 'house st', city: 'hoboken', state: 'NY'}
                         ];
  var address_with_zip = [{ number: 1, street: 'main st', city: 'new york', state: 'ny', zip: 10010},
                          { number: 4, street: 'ape ave', city: 'san diego', state: 'CA', zip: 98970},
                          { number: 19, street: 'house dr', city: 'houston', state: 'TX', zip: 79089}
                         ];

  var testParse = function(query, hasNumber, hasZip) {
    var testcase = 'parse query with ' + (hasNumber ? 'a house number ': 'no house number ');
    testcase += 'and ' + (hasZip ? 'a zip ' : 'no zip ');

    test(testcase, function(t) {
      var query_string = '';
      for (var k in query) {
        query_string += ' ' + query[k];
      }

      // remove leading whitespace
      query_string = query_string.substring(1);

      var address = parser(query_string);
      var non_address_layer = get_layers(['admin', 'poi']);

      t.equal(typeof address, 'object', 'valid object for the address ('+query_string+')');

      if (!hasNumber && !hasZip && query.non_street) {
        t.equal(address.regions.join(''), query_string, 'expected parsing result');
      } else {
        t.equal(address.regions.join(''), query.city, 'city in regions (' + query.city +')');
      }

      if ((hasNumber || hasZip) && query.street) {
        t.equal(typeof address.number, 'number', 'valid house number format (' + address.number + ')');
        t.equal(address.number, query.number, 'correct house number (' + query.number + ')');
        t.equal(typeof address.street, 'string', 'valid street name format (' + address.street + ')');
        t.equal(address.street, query.street, 'correct street name (' + query.street + ')');
      }

      if (hasZip) {
        t.equal(typeof address.postalcode, 'number', 'valid zip (' + address.postalcode + ')');
        t.equal(address.postalcode, query.zip, 'correct postal code (' + query.zip + ')');
      }

      t.end();
    });
  };

  for (var key in addresses_nonum) {
    testParse( addresses_nonum[key] );
  }
  for (key in address_with_num) {
    testParse( address_with_num[key], true );
  }
  for (key in address_with_zip) {
    testParse( address_with_zip[key], true, true );
  }
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('QUERY PARSING: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
