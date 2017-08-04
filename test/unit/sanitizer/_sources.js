var type_mapping = require('../../../helper/type_mapping');
var sanitizer = require( '../../../sanitizer/_targets' )('sources', type_mapping.source_mapping);

var success_messages = { error: false };

module.exports.tests = {};

module.exports.tests.no_sources = function(test, common) {
  test('sources is not set', function(t) {
    var req = {
      query: { },
      clean: { }
    };

    var messages = sanitizer.sanitize(req.query, req.clean);

    t.equal(req.clean.sources, undefined, 'no sources should be defined');
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
       'Valid options: osm,oa,gn,wof,openstreetmap,openaddresses,geonames,whosonfirst';

    var messages = sanitizer.sanitize(req.query, req.clean);

    t.equal(req.clean.sources, undefined, 'no sources should be defined');
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

    var messages = sanitizer.sanitize(req.query, req.clean);

    t.deepEqual(req.clean.sources, ['geonames'], 'sources should contain geonames');
    t.deepEqual(messages.errors, [], 'no error returned');
    t.deepEqual(messages.warnings, [], 'no warnings returned');

    t.end();
  });

  test('openstreetmap (abbreviated) source', function(t) {
    var req = {
      query: {
        sources: 'osm'
      },
      clean: { }
    };

    var messages = sanitizer.sanitize(req.query, req.clean);

    t.deepEqual(req.clean.sources, ['openstreetmap'], 'abbreviation is expanded to full version');
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

    var messages = sanitizer.sanitize(req.query, req.clean);

    t.deepEqual(req.clean.sources, ['openstreetmap', 'openaddresses'],
                'clean.sources should contain openstreetmap and openadresses');
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
        '\'notasource\' is an invalid sources parameter. ' +
        'Valid options: osm,oa,gn,wof,openstreetmap,openaddresses,geonames,whosonfirst'
      ],
      warnings: []
    };

    var messages = sanitizer.sanitize(req.query, req.clean);

    t.deepEqual(messages, expected_messages, 'error with message returned');
    t.equal(req.clean.sources, undefined, 'clean.sources should remain empty');
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
