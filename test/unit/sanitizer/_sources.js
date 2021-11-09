const fake_type_mapping = {
  osm: ['openstreetmap'],
  oa: ['openaddresses'],
  gn: ['geonames'],
  wof: ['whosonfirst'],
  openstreetmap: ['openstreetmap'],
  openaddresses: ['openaddresses'],
  geonames: ['geonames'],
  whosonfirst: ['whosonfirst'],
};

var sanitizer = require('../../../sanitizer/_targets')(
  'sources',
  fake_type_mapping,
);

var success_messages = { error: false };

module.exports.tests = {};

module.exports.tests.no_sources = function (test, common) {
  test('sources is not set', function (t) {
    var req = {
      query: {},
      clean: {},
    };

    var messages = sanitizer.sanitize(req.query, req.clean);

    t.equal(req.clean.sources, undefined, 'no sources should be defined');
    t.deepEqual(messages.errors, [], 'no error returned');
    t.deepEqual(messages.warnings, [], 'no warnings returned');
    t.end();
  });

  test('source is empty string', function (t) {
    var req = {
      query: {
        sources: '',
      },
      clean: {},
    };

    var expected_error =
      'sources parameter cannot be an empty string. ' +
      'Valid options: osm,oa,gn,wof,openstreetmap,openaddresses,geonames,whosonfirst';

    var messages = sanitizer.sanitize(req.query, req.clean);

    t.equal(req.clean.sources, undefined, 'no sources should be defined');
    t.deepEqual(messages.errors.length, 1, 'error returned');
    t.deepEqual(messages.errors[0], expected_error, 'error returned');
    t.deepEqual(messages.warnings, [], 'no warnings returned');
    t.end();
  });
};

module.exports.tests.valid_sources = function (test, common) {
  test('geonames source', function (t) {
    var req = {
      query: {
        sources: 'geonames',
      },
      clean: {},
    };

    var messages = sanitizer.sanitize(req.query, req.clean);

    t.deepEqual(
      req.clean.sources,
      ['geonames'],
      'sources should contain geonames',
    );
    t.deepEqual(messages.errors, [], 'no error returned');
    t.deepEqual(messages.warnings, [], 'no warnings returned');

    t.end();
  });

  test('openstreetmap (abbreviated) source', function (t) {
    var req = {
      query: {
        sources: 'osm',
      },
      clean: {},
    };

    var messages = sanitizer.sanitize(req.query, req.clean);

    t.deepEqual(
      req.clean.sources,
      ['openstreetmap'],
      'abbreviation is expanded to full version',
    );
    t.deepEqual(messages.errors, [], 'no error returned');
    t.deepEqual(messages.warnings, [], 'no warnings returned');
    t.end();
  });

  test('multiple sources', function (t) {
    var req = {
      query: {
        sources: 'openstreetmap,openaddresses',
      },
      clean: {},
    };

    var messages = sanitizer.sanitize(req.query, req.clean);

    t.deepEqual(
      req.clean.sources,
      ['openstreetmap', 'openaddresses'],
      'clean.sources should contain openstreetmap and openadresses',
    );
    t.deepEqual(messages.errors, [], 'no error returned');
    t.deepEqual(messages.warnings, [], 'no warnings returned');
    t.end();
  });
};

module.exports.tests.invalid_sources = function (test, common) {
  test('geonames source', function (t) {
    var req = {
      query: {
        sources: 'notasource',
      },
      clean: {},
    };
    var expected_messages = {
      errors: [
        "'notasource' is an invalid sources parameter. " +
          'Valid options: osm,oa,gn,wof,openstreetmap,openaddresses,geonames,whosonfirst',
      ],
      warnings: [],
    };

    var messages = sanitizer.sanitize(req.query, req.clean);

    t.deepEqual(messages, expected_messages, 'error with message returned');
    t.equal(req.clean.sources, undefined, 'clean.sources should remain empty');
    t.end();
  });
};

module.exports.tests.negative_sources = function (test, common) {
  test('negative source only', function (t) {
    const raw = {
      sources: '-geonames',
    };
    const clean = {};

    const messages = sanitizer.sanitize(raw, clean);

    const expected_sources = ['openstreetmap', 'openaddresses', 'whosonfirst'];

    t.deepEqual(messages.errors, [], 'no error returned');
    t.deepEqual(
      clean.sources,
      expected_sources,
      'geonames source should be removed from clean.sources',
    );
    t.end();
  });

  test('positive and negative sources', function (t) {
    const raw = {
      sources: '-geonames,osm',
    };
    const clean = {};

    const messages = sanitizer.sanitize(raw, clean);

    const expected_sources = ['openstreetmap'];

    t.deepEqual(messages.errors, [], 'no error returned');
    t.deepEqual(
      clean.sources,
      expected_sources,
      'only OSM should be present in sources',
    );
    t.deepEqual(
      clean.negative_sources,
      ['geonames'],
      'negative_sources clean property set',
    );
    t.deepEqual(
      clean.positive_sources,
      ['openstreetmap'],
      'negative_sources clean property set',
    );
    t.end();
  });

  test('positive and negative sources resulting in empty list', function (t) {
    const raw = {
      sources: '-geonames,osm,-osm',
    };
    const clean = {};

    const messages = sanitizer.sanitize(raw, clean);

    const expected_sources = ['openstreetmap'];

    t.deepEqual(
      messages.errors.length,
      1,
      'error emitted because no sources remain after positive and negative filters',
    );
    t.deepEqual(
      clean.sources,
      undefined,
      'sources is left undefined in case of error',
    );
    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('SANTIZE _sources ' + name, testFunction);
  }

  for (var testCase in module.exports.tests) {
    module.exports.tests[testCase](test, common);
  }
};
