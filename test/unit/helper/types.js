var types = require('../../../helper/types');

module.exports.tests = {};

module.exports.tests.no_cleaned_types = function(test, common) {
  test('no cleaned types', function(t) {
    try {
      types();
      t.fail('exception should be thrown');
    }
    catch (err) {
      t.equal(err.message, 'clean_types should not be null or undefined', 'no input should result in exception');
    }
    finally {
      t.end();
    }
  });

  test('no cleaned types', function(t) {
    try {
      types({});
      t.fail('exception should be thrown');
    }
    catch (err) {
      t.equal(err.message, 'clean_types should not be null or undefined', 'no input should result in exception');
    }
    finally {
      t.end();
    }
  });
};

module.exports.tests.address_parser = function(test, common) {
  test('address parser specifies only admin layers', function(t) {
    var cleaned_types = {
      from_text_parser: ['admin0'] // simplified return value from address parser
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
      from_text_parser: ['admin0'] // simplified return value from address parse
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
      from_sources: ['openaddresses']
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
      from_sources: ['openaddresses'],
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
