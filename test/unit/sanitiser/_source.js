var sanitize = require( '../../../sanitiser/_source' );

var success_response = { error: false };

module.exports.tests = {};

module.exports.tests.no_sources = function(test, common) {
  test('source is not set', function(t) {
    var req = {
      query: { },
      clean: { }
    };

    var response = sanitize(req.query, req.clean);

    t.deepEqual(req.clean.types, {}, 'clean.types should be empty object');
    t.deepEqual(response.errors, [], 'no error returned');
    t.deepEqual(response.warnings, [], 'no warnings returned');
    t.end();
  });

  test('source is empty string', function(t) {
    var req = {
      query: {
        source: ''
      },
      clean: { }
    };

    var response = sanitize(req.query, req.clean);

    t.deepEqual(req.clean.types, {}, 'clean.types should be empty object');
    t.deepEqual(response.errors, [], 'no error returned');
    t.deepEqual(response.warnings, [], 'no warnings returned');
    t.end();
  });
};

module.exports.tests.valid_sources = function(test, common) {
  test('geonames source', function(t) {
    var req = {
      query: {
        source: 'geonames'
      },
      clean: { }
    };

    var response = sanitize(req.query, req.clean);

    t.deepEqual(req.clean.types, { from_source: ['geoname'] }, 'clean.types should contain from_source entry with geonames');
    t.deepEqual(response.errors, [], 'no error returned');
    t.deepEqual(response.warnings, [], 'no warnings returned');
    t.end();
  });

  test('openstreetmap source', function(t) {
    var req = {
      query: {
        source: 'openstreetmap'
      },
      clean: { }
    };
    var expected_types = {
      from_source: ['osmaddress', 'osmnode', 'osmway']
    };

    var response = sanitize(req.query, req.clean);

    t.deepEqual(req.clean.types, expected_types, 'clean.types should contain from_source entry with multiple entries for openstreetmap');
    t.deepEqual(response.errors, [], 'no error returned');
    t.deepEqual(response.warnings, [], 'no warnings returned');
    t.end();
  });

  test('multiple sources', function(t) {
    var req = {
      query: {
        source: 'openstreetmap,openaddresses'
      },
      clean: { }
    };
    var expected_types = {
      from_source: ['osmaddress', 'osmnode', 'osmway', 'openaddresses']
    };

    var response = sanitize(req.query, req.clean);

    t.deepEqual(req.clean.types, expected_types,
                'clean.types should contain from_source entry with multiple entries for openstreetmap and openadresses');
    t.deepEqual(response.errors, [], 'no error returned');
    t.deepEqual(response.warnings, [], 'no warnings returned');
    t.end();
  });
};

module.exports.tests.invalid_sources = function(test, common) {
  test('geonames source', function(t) {
    var req = {
      query: {
        source: 'notasource'
      },
      clean: { }
    };
    var expected_response = {
      errors: [
        '\'notasource\' is an invalid source parameter. Valid options: geonames,openaddresses,quattroshapes,openstreetmap'
      ],
      warnings: []
    };

    var response = sanitize(req.query, req.clean);

    t.deepEqual(response, expected_response, 'error with message returned');
    t.deepEqual(req.clean.types, { }, 'clean.types should remain empty');
    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('SANTIZE _source ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
