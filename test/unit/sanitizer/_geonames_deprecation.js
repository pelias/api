const sanitizer = require('../../../sanitizer/_geonames_deprecation')();

module.exports.tests = {};

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

};

module.exports.tests.error_conditions = (test, common) => {
  test('only geonames in sources should not modify clean.sources and add error message', (t) => {
    ['gn', 'geonames'].forEach((sources) => {
      const clean = {
        sources: [sources]
      };

      const messages = sanitizer.sanitize(undefined, clean);

      t.deepEquals(clean.sources, [sources]);
      t.deepEquals(messages.errors, ['/reverse does not support geonames']);
      t.deepEquals(messages.warnings, []);

    });

    t.end();

  });

};

module.exports.tests.warning_conditions = (test, common) => {
  test('only geonames in sources should not modify clean.sources and add error message', (t) => {
    ['gn', 'geonames'].forEach((sources) => {
      const clean = {
        sources: ['another source', sources, 'yet another source']
      };

      const messages = sanitizer.sanitize(undefined, clean);

      t.deepEquals(clean.sources, ['another source', 'yet another source']);
      t.deepEquals(messages.errors, []);
      t.deepEquals(messages.warnings, ['/reverse does not support geonames']);

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
