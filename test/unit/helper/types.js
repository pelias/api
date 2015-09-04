var types = require('../../../helper/types');

var valid_types = require( '../../../query/types' );
module.exports.tests = {};

module.exports.tests.no_cleaned_types = function(test, common) {
  test('no cleaned types', function(t) {
    var actual = types(undefined);
    t.equal(actual, undefined, 'all valid types returned for empty input');
    t.end();
  });

  test('no cleaned types', function(t) {
    var cleaned_types = {};
    var actual = types(cleaned_types);
    t.equal(actual, undefined, 'all valid types returned for empty input');
    t.end();
  });
};

module.exports.tests.address_parser = function(test, common) {
  test('address parser specifies only admin layers', function(t) {
    var cleaned_types = {
      from_address_parser: ['admin0'] // simplified return value from address parser
    };
    var actual = types(cleaned_types);
    var expected = ['admin0']; // simplified expected value for all admin layers
    t.deepEqual(actual, expected, 'only layers specified by address parser returned');
    t.end();
  });
};

module.exports.tests.layers_parameter = function(test, common) {
  test('layers parameter specifies only some layers', function(t) {
    var cleaned_types = {
      from_layers: ['geoname']
    };
    var actual = types(cleaned_types);
    var expected = ['geoname'];
    t.deepEqual(actual, expected, 'only types specified by layers parameter returned');
    t.end();
  });
};

module.exports.tests.layers_parameter_and_address_parser = function(test, common) {
  test('layers parameter and address parser present', function(t) {
    var cleaned_types = {
      from_layers: ['geoname'],
      from_address_parser: ['admin0'] // simplified return value from address parse
    };
    var actual = types(cleaned_types);
    var expected = ['geoname'];
    t.deepEqual(actual, expected, 'layers parameter overrides address parser completely');
    t.end();
  });
};

module.exports.tests.source_parameter = function(test, common) {
  test('source parameter specified', function(t) {
    var cleaned_types = {
      from_source: ['openaddresses']
    };

    var actual = types(cleaned_types);

    var expected = ['openaddresses'];
    t.deepEqual(actual, expected, 'type parameter set to types specified by source');
    t.end();
  });
};

module.exports.tests.source_and_layers_parameters = function(test, common) {
  test('source and layers parameter both specified', function(t) {
    var cleaned_types = {
      from_source: ['openaddresses'],
      from_layers: ['osmaddress', 'openaddresses']
    };

    var actual = types(cleaned_types);

    var expected = ['openaddresses'];
    t.deepEqual(actual, expected, 'type set to intersection of source and layer types');
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('types: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
