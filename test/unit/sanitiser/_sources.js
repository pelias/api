var sanitize = require( '../../../sanitiser/_targets' )('sources', require('../../../query/sources'));

var success_messages = { error: false };

module.exports.tests = {};

module.exports.tests.no_sources = function(test, common) {
  test('sources is not set', function(t) {
    var req = {
      query: { },
      clean: { }
    };

    var messages = sanitize(req.query, req.clean);

    t.deepEqual(req.clean.types, {}, 'clean.types should be empty object');
    t.deepEqual(messages.errors, [], 'no error returned');
    t.deepEqual(messages.warnings, [], 'no warnings returned');
    t.end();
  });

  test('source is empty string', function(t) {
    var req = {
      query: {
        sources: ''
      },
      clean: { }
    };

    var expected_error = 'sources parameter cannot be an empty string. ' +
       'Valid options: gn,geonames,oa,openaddresses,qs,quattroshapes,osm,openstreetmap';

    var messages = sanitize(req.query, req.clean);

    t.deepEqual(req.clean.types, {}, 'clean.types should be empty object');
    t.deepEqual(messages.errors.length, 1, 'error returned');
    t.deepEqual(messages.errors[0], expected_error, 'error returned');
    t.deepEqual(messages.warnings, [], 'no warnings returned');
    t.end();
  });
};

module.exports.tests.valid_sources = function(test, common) {
  test('geonames source', function(t) {
    var req = {
      query: {
        sources: 'geonames'
      },
      clean: { }
    };

    var messages = sanitize(req.query, req.clean);

    t.deepEqual(req.clean.types, { from_sources: ['geoname'] }, 'clean.types should contain from_source entry with geonames');
    t.deepEqual(messages.errors, [], 'no error returned');
    t.deepEqual(messages.warnings, [], 'no warnings returned');

    t.end();
  });

  test('openstreetmap source', function(t) {
    var req = {
      query: {
        sources: 'openstreetmap'
      },
      clean: { }
    };
    var expected_types = {
      from_sources: ['osmaddress', 'osmnode', 'osmway']
    };

    var messages = sanitize(req.query, req.clean);

    t.deepEqual(req.clean.types, expected_types, 'clean.types should contain from_source entry with multiple entries for openstreetmap');
    t.deepEqual(messages.errors, [], 'no error returned');
    t.deepEqual(messages.warnings, [], 'no warnings returned');
    t.end();
  });

  test('multiple sources', function(t) {
    var req = {
      query: {
        sources: 'openstreetmap,openaddresses'
      },
      clean: { }
    };
    var expected_types = {
      from_sources: ['osmaddress', 'osmnode', 'osmway', 'openaddresses']
    };

    var messages = sanitize(req.query, req.clean);

    t.deepEqual(req.clean.types, expected_types,
                'clean.types should contain from_source entry with multiple entries for openstreetmap and openadresses');
    t.deepEqual(messages.errors, [], 'no error returned');
    t.deepEqual(messages.warnings, [], 'no warnings returned');
    t.end();
  });
};

module.exports.tests.invalid_sources = function(test, common) {
  test('geonames source', function(t) {
    var req = {
      query: {
        sources: 'notasource'
      },
      clean: { }
    };
    var expected_messages = {
      errors: [
        '\'notasource\' is an invalid sources parameter. Valid options: gn,geonames,oa,openaddresses,qs,quattroshapes,osm,openstreetmap'
      ],
      warnings: []
    };

    var messages = sanitize(req.query, req.clean);

    t.deepEqual(messages, expected_messages, 'error with message returned');
    t.deepEqual(req.clean.types, { }, 'clean.types should remain empty');
    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('SANTIZE _sources ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
