const sanitizer = require('../../../sanitizer/_geonames_deprecation')();

module.exports.tests = {};

const coarse_reverse_message ='coarse /reverse does not support geonames. See https://github.com/pelias/pelias/issues/675 for more info';

module.exports.tests.no_warnings_or_errors_conditions = (test, common) => {
  test('undefined sources should add neither warnings nor errors', (t) => {
    const clean = {};

    const messages = sanitizer.sanitize(undefined, clean);

    t.deepEquals(clean, {});
    t.deepEquals(messages, { errors: [], warnings: [] });
    t.end();

  });

  test('geonames/gn not in sources should add neither warnings nor errors', (t) => {
    const clean = {
      sources: ['source 1', 'source 2'],
    };

    const messages = sanitizer.sanitize(undefined, clean);

    t.deepEquals(clean.sources, ['source 1', 'source 2']);
    t.deepEquals(messages, { errors: [], warnings: [] });
    t.end();

  });

  test('geonames/gn in sources with layers=venue should add neither warnings nor errors', (t) => {
    const clean = {
      sources: ['geonames'],
      layers: ['venue']
    };

    const messages = sanitizer.sanitize(undefined, clean);

    t.deepEquals(clean.sources, ['geonames']);
    t.deepEquals(messages, { errors: [], warnings: [] });
    t.end();
  });
};

module.exports.tests.error_conditions = (test, common) => {
  test('only geonames in sources with layers=coarse should not modify clean.sources and add error message', (t) => {
    ['gn', 'geonames'].forEach((sources) => {
      const clean = {
        sources: [sources],
        layers: ['coarse']
      };

      const messages = sanitizer.sanitize(undefined, clean);

      t.deepEquals(clean.sources, [sources]);
      t.deepEquals(messages.errors, [ coarse_reverse_message ]);
      t.deepEquals(messages.warnings, []);

    });

    t.end();
  });

  test('only geonames in sources with layers=locality should not modify clean.sources and add error message', (t) => {
    ['gn', 'geonames'].forEach((sources) => {
      const clean = {
        sources: [sources],
        layers: ['locality']
      };

      const messages = sanitizer.sanitize(undefined, clean);

      t.deepEquals(clean.sources, [sources]);
      t.deepEquals(messages.errors, [ coarse_reverse_message ]);
      t.deepEquals(messages.warnings, []);

    });

    t.end();
  });
};

module.exports.tests.warning_conditions = (test, common) => {
  test('only geonames in sources and layers=coarse should not modify clean.sources and add error message', (t) => {
    ['gn', 'geonames'].forEach((sources) => {
      const clean = {
        sources: ['another source', sources, 'yet another source'],
        layers: ['coarse']
      };

      const messages = sanitizer.sanitize(undefined, clean);

      t.deepEquals(clean.sources, ['another source', 'yet another source']);
      t.deepEquals(messages.errors, []);
      t.deepEquals(messages.warnings, [ coarse_reverse_message ]);

    });

    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`SANITIZE _geonames_deprecation ${name}`, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
