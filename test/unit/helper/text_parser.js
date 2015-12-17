var parser = require('../../../helper/text_parser');

var type_mapping = require('../../../helper/type_mapping');
var layers_map = type_mapping.layer_with_aliases_to_type;

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('interface', function(t) {
    t.equal(typeof parser.get_parsed_address, 'function', 'valid function');
    t.equal(typeof parser.get_layers, 'function', 'valid function');
    t.end();
  });
};

module.exports.tests.split_on_comma = function(test, common) {
  var queries = [
    { name: 'soho', admin_parts: 'new york' },
    { name: 'chelsea', admin_parts: 'london' },
    { name: '123 main', admin_parts: 'new york' }
  ];

  queries.forEach(function (query) {
    test('naive parsing ' + query, function(t) {
      var address = parser.get_parsed_address(query.name + ', ' + query.admin_parts);

      t.equal(typeof address, 'object', 'valid object');
      t.equal(address.name, query.name, 'name set correctly to ' + address.name);
      t.equal(address.admin_parts, query.admin_parts, 'admin_parts set correctly to ' + address.admin_parts);
      t.end();
    });
  });
};

module.exports.tests.parse_three_chars_or_less = function(test, common) {
  var chars_queries = ['a', 'bb', 'ccc'];
  var num_queries   = ['1', '12', '123'];
  var alphanum_q    = ['a1', '1a2', '12c'];

  var queries = chars_queries.concat(num_queries).concat(alphanum_q);
  queries.forEach(function(query) {
    test('query length < 3 (' + query + ')', function(t) {
      var address = parser.get_parsed_address(query);
      var target_layer = layers_map.coarse;
      var layers = parser.get_layers(query);

      t.equal(typeof address, 'object', 'valid object');
      t.deepEqual(layers, target_layer, 'admin_parts set correctly to ' + target_layer.join(', '));
      t.end();
    });
  });
};

module.exports.tests.parse_one_token = function(test, common) {
  test('query with one token', function (t) {
    var address = parser.get_parsed_address('yugolsavia');
    t.equal(address, null, 'nothing address specific detected');
    t.end();
  });
  test('query with two tokens, no numbers', function (t) {
    var address = parser.get_parsed_address('small town');
    t.equal(address, null, 'nothing address specific detected');
    t.end();
  });
  test('query with two tokens, number first', function (t) {
    var address = parser.get_parsed_address('123 main');
    t.equal(address, null, 'nothing address specific detected');
    t.end();
  });
  test('query with two tokens, number second', function (t) {
    var address = parser.get_parsed_address('main 123');
    t.equal(address, null, 'nothing address specific detected');
    t.end();
  });
  test('query with many tokens', function(t) {
    var address = parser.get_parsed_address('main particle new york');
    t.equal(address, null, 'nothing address specific detected');
    t.end();
  });
};

module.exports.tests.parse_address = function(test, common) {
  test('valid address, house number', function(t) {
    var query_string = '123 main st new york ny';
    var address = parser.get_parsed_address(query_string);

    t.equal(typeof address, 'object', 'valid object for the address');
    t.equal(address.number, '123', 'parsed house number');
    t.equal(address.street, 'main st', 'parsed street');
    t.deepEqual(address.regions, ['new york'], 'parsed city');
    t.equal(address.state , 'NY', 'parsed state');
    t.end();
  });
  test('valid address, zipcode', function(t) {
    var query_string = '123 main st new york ny 10010';
    var address = parser.get_parsed_address(query_string);

    t.equal(typeof address, 'object', 'valid object for the address');
    t.equal(address.number, '123', 'parsed house number');
    t.equal(address.street, 'main st', 'parsed street');
    t.deepEqual(address.regions, ['new york'], 'parsed city');
    t.equal(address.state , 'NY', 'parsed state');
    t.equal(address.postalcode, '10010', 'parsed zip is a string');
    t.end();
  });
  test('valid address with leading 0s in zipcode', function(t) {
    var query_string = '339 W Main St, Cheshire, 06410';
    var address = parser.get_parsed_address(query_string);

    console.log(address);

    t.equal(typeof address, 'object', 'valid object for the address');
    t.equal(address.street, 'W Main St', 'parsed street');
    t.deepEqual(address.regions, ['Cheshire'], 'parsed city');
    t.equal(address.postalcode, '06410', 'parsed zip');
    t.end();
  });
};


module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('QUERY PARSING: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
