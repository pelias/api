const _ = require('lodash');

const sanitizer = require('../../../sanitizer/_geonames_warnings')();

const nonAdminProperties = ['number', 'street', 'query', 'category'];
const adminProperties = ['neighbourhood', 'borough', 'city', 'county', 'state', 'postalcode', 'country'];

module.exports.tests = {};

module.exports.tests.no_errors = (test, common) => {
  test('undefined clean.parsed_text should exit early', (t) => {
    const clean = {
      sources: ['geonames'],
    };

    const messages = sanitizer.sanitize(undefined, clean);

    t.deepEquals(messages, { errors: [], warnings: [] });
    t.end();

  });

  test('any non-admin analysis field with only geonames sources should exit early', (t) => {
    adminProperties.forEach((adminProperty) => {
      nonAdminProperties.forEach((nonAdminProperty) => {
        const clean = {
          sources: ['geonames'],
          parsed_text: {}
        };
        clean.parsed_text[nonAdminProperty] = `${nonAdminProperty} value`;
        clean.parsed_text[adminProperty] = `${adminProperty} value`;

        const messages = sanitizer.sanitize(undefined, clean);

        t.deepEquals(messages, { errors: [], warnings: [] });

      });
    });
    t.end();

  });

  test('any non-admin analysis field with non-geonames sources should exit early', (t) => {
    adminProperties.forEach((adminProperty) => {
      nonAdminProperties.forEach((nonAdminProperty) => {
        const clean = {
          sources: ['this is not geonames'],
          parsed_text: {}
        };
        clean.parsed_text[nonAdminProperty] = `${nonAdminProperty} value`;
        clean.parsed_text[adminProperty] = `${adminProperty} value`;

        const messages = sanitizer.sanitize(undefined, clean);

        t.deepEquals(messages, { errors: [], warnings: [] });

      });
    });
    t.end();

  });

};

module.exports.tests.error_conditions = (test, common) => {
  test('any admin analysis field and only geonames sources should return error', (t) => {
    adminProperties.forEach((property) => {
      const clean = _.set({ sources: ['geonames'] },
        ['parsed_text', property], `${property} value`);

      const messages = sanitizer.sanitize(undefined, clean);

      t.deepEquals(messages.errors, ['input contains only administrative area data, ' +
        'no results will be returned when sources=geonames']);
      t.deepEquals(messages.warnings, []);

    });
    t.end();

  });

};

module.exports.tests.warning_conditions = (test, common) => {
  test('any admin analysis field and only geonames sources should return warning', (t) => {
    adminProperties.forEach((property) => {
      const clean = _.set({ sources: ['source 1', 'geonames', 'source 2'] },
        ['parsed_text', property], `${property} value`);

      const messages = sanitizer.sanitize(undefined, clean);

      t.deepEquals(messages.errors, []);
      t.deepEquals(messages.warnings, ['input contains only administrative area data, ' +
        'geonames results will not be returned']);

    });
    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape(`SANTIZE _geonames_warnings ${name}`, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
