var VariableStore = require('pelias-query').Vars;
var text_parser = require('../../../query/text_parser');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof text_parser, 'function', 'valid function');
    t.end();
  });
};

module.exports.tests.query = function(test, common) {
  test('parsed_text without properties should leave vs properties unset', function(t) {
    var parsed_text = {};
    var vs = new VariableStore();

    text_parser(parsed_text, vs);

    t.false(vs.isset('input:query'));
    t.false(vs.isset('input:category'));
    t.false(vs.isset('input:housenumber'));
    t.false(vs.isset('input:street'));
    t.false(vs.isset('input:neighbourhood'));
    t.false(vs.isset('input:borough'));
    t.false(vs.isset('input:postcode'));
    t.false(vs.isset('input:locality'));
    t.false(vs.isset('input:county'));
    t.false(vs.isset('input:region'));
    t.false(vs.isset('input:country'));
    t.end();

  });

  test('parsed_text without properties should leave vs properties unset', function(t) {
    var parsed_text = {
      query: 'query value',
      category: 'category value',
      number: 'number value',
      street: 'street value',
      neighbourhood: 'neighbourhood value',
      borough: 'borough value',
      postalcode: 'postalcode value',
      city: 'city value',
      county: 'county value',
      state: 'state value',
      country: 'country value'
    };
    var vs = new VariableStore();

    text_parser(parsed_text, vs);

    t.equals(vs.var('input:query').toString(), 'query value');
    t.equals(vs.var('input:category').toString(), 'category value');
    t.equals(vs.var('input:housenumber').toString(), 'number value');
    t.equals(vs.var('input:street').toString(), 'street value');
    t.equals(vs.var('input:neighbourhood').toString(), 'neighbourhood value');
    t.equals(vs.var('input:borough').toString(), 'borough value');
    t.equals(vs.var('input:postcode').toString(), 'postalcode value');
    t.equals(vs.var('input:locality').toString(), 'city value');
    t.equals(vs.var('input:county').toString(), 'county value');
    t.equals(vs.var('input:region').toString(), 'state value');
    t.equals(vs.var('input:country').toString(), 'country value');
    t.end();

  });

};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('text_parser ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
