const proxyquire = require('proxyquire').noCallThru();
const realPeliasConfig = require('pelias-config');

const makePeliasConfig = (addendum_namespaces) => {
  const config = realPeliasConfig.generateDefaults();

  return addendum_namespaces ? {
    generate: () => ({
      ...config,
      addendum_namespaces: addendum_namespaces,
      get: (name) => name === 'addendum_namespaces' ? addendum_namespaces : undefined
    }),
  } : {
    generate: () => ({
      ...config,
      get: () => undefined
    }),
  };
};

module.exports.tests = {};

module.exports.tests.sanitize_boundary_country = function (test, common) {
  test('no addendum_namespaces config, should return no errors and warnings', function (t) {
    const raw = {};
    const clean = {};
    const sanitizer = proxyquire('../../../sanitizer/_addendum', { 'pelias-config': makePeliasConfig() });
    const errorsAndWarnings = sanitizer().sanitize(raw, clean);
    t.deepEquals(clean, {}, 'should be empty object');
    t.deepEquals(errorsAndWarnings, { errors: [], warnings: [] }, 'no warnings or errors');
    t.end();
  });

  test('configured addendum_namespace of any type with empty value, should return error', function (t) {
    const raw = { tariff_zone_id: '' };
    const clean = {};
    const sanitizer = proxyquire('../../../sanitizer/_addendum', {
      'pelias-config': makePeliasConfig({
        tariff_zone_id: {
          type: 'string'
        }
      })
    });
    const errorsAndWarnings = sanitizer().sanitize(raw, clean);
    t.deepEquals(clean.tariff_zone_id, undefined, 'should be undefined');
    t.deepEquals(
      errorsAndWarnings,
      { errors: ['tariff_zone_id should be a non empty string'], warnings: [] },
      'Empty string should not be excepted');
    t.end();
  });

  test('configured addendum_namespace of type array, with correct raw data, should return no errors and warnings', function (t) {
    const raw = { tariff_zone_ids: '1,2,3' };
    const clean = {};
    const sanitizer = proxyquire('../../../sanitizer/_addendum', {
      'pelias-config': makePeliasConfig({
        tariff_zone_ids: {
          type: 'array'
        }
      })
    });
    const errorsAndWarnings = sanitizer().sanitize(raw, clean);
    t.deepEquals(clean.tariff_zone_ids, ['1', '2', '3'], 'should be an array');
    t.deepEquals(errorsAndWarnings, { errors: [], warnings: [] }, 'no warnings or errors');
    t.end();
  });

  test('configured addendum_namespace of type array, with only commas, should and sanitized with errors', function (t) {
    const raw = { tariff_zone_ids: ',,,' };
    const clean = {};
    const sanitizer = proxyquire('../../../sanitizer/_addendum', {
      'pelias-config': makePeliasConfig({
        tariff_zone_ids: {
          type: 'array'
        }
      })
    });
    const errorsAndWarnings = sanitizer().sanitize(raw, clean);
    t.deepEquals(clean.tariff_zone_ids, undefined, 'should be undefined');
    t.deepEquals(errorsAndWarnings, {
      errors: ['tariff_zone_ids should not be empty'],
      warnings: []
    }, 'no warnings or errors');
    t.end();
  });

  test('configured addendum_namespace of type array should be sanitized, and should return no errors and warnings', function (t) {
    const raw = { tariff_zone_ids: ',1,,3' };
    const clean = {};
    const sanitizer = proxyquire('../../../sanitizer/_addendum', {
      'pelias-config': makePeliasConfig({
        tariff_zone_ids: {
          type: 'array'
        }
      })
    });
    const errorsAndWarnings = sanitizer().sanitize(raw, clean);
    t.deepEquals(clean.tariff_zone_ids, ['1', '3'], 'should be an array');
    t.deepEquals(errorsAndWarnings, { errors: [], warnings: [] }, 'no warnings or errors');
    t.end();
  });

  test('configured addendum_namespace of type array, with the single string, sanitized and should return no errors and warnings',
    function (t) {
      const raw = { tariff_zone_ids: '1' };
      const clean = {};
      const sanitizer = proxyquire('../../../sanitizer/_addendum', {
        'pelias-config': makePeliasConfig({
          tariff_zone_ids: {
            type: 'array'
          }
        })
      });
      const errorsAndWarnings = sanitizer().sanitize(raw, clean);
      t.deepEquals(clean.tariff_zone_ids, ['1'], 'should be an array');
      t.deepEquals(errorsAndWarnings, { errors: [], warnings: [] }, 'no warnings or errors');
      t.end();
    });

  test('configured addendum_namespace of type string with correct raw data, should return no errors and warnings', function (t) {
    const raw = { tariff_zone_id: 'TAR-1' };
    const clean = {};
    const sanitizer = proxyquire('../../../sanitizer/_addendum', {
      'pelias-config': makePeliasConfig({
        tariff_zone_id: {
          type: 'string'
        }
      })
    });
    const errorsAndWarnings = sanitizer().sanitize(raw, clean);
    t.deepEquals(clean.tariff_zone_id, 'TAR-1', 'should be valid string');
    t.deepEquals(errorsAndWarnings, { errors: [], warnings: [] }, 'no warnings or errors');
    t.end();
  });

  test('configured addendum_namespace of type string with extra spaces, should be trimmed', function (t) {
    const raw = { tariff_zone_id: '          TAR-1         ' };
    const clean = {};
    const sanitizer = proxyquire('../../../sanitizer/_addendum', {
      'pelias-config': makePeliasConfig({
        tariff_zone_id: {
          type: 'string'
        }
      })
    });
    const errorsAndWarnings = sanitizer().sanitize(raw, clean);
    t.deepEquals(clean.tariff_zone_id, 'TAR-1', 'should be valid string');
    t.deepEquals(errorsAndWarnings, { errors: [], warnings: [] }, 'no warnings or errors');
    t.end();
  });

  test('configured addendum_namespace of type number with correct value, should return no errors and warnings', function (t) {
    const raw = { tariff_zone_id: '123' };
    const clean = {};
    const sanitizer = proxyquire('../../../sanitizer/_addendum', {
      'pelias-config': makePeliasConfig({
        tariff_zone_id: {
          type: 'number'
        }
      })
    });
    const errorsAndWarnings = sanitizer().sanitize(raw, clean);
    t.deepEquals(clean.tariff_zone_id, 123, 'should be valid number');
    t.deepEquals(errorsAndWarnings, { errors: [], warnings: [] }, 'no warnings or errors');
    t.end();
  });

  test('configured addendum_namespace of type number with incorrect value, should return error', function (t) {
    const raw = { tariff_zone_id: '123b' };
    const clean = {};
    const sanitizer = proxyquire('../../../sanitizer/_addendum', {
      'pelias-config': makePeliasConfig({
        tariff_zone_id: {
          type: 'number'
        }
      })
    });
    const errorsAndWarnings = sanitizer().sanitize(raw, clean);
    t.deepEquals(clean.tariff_zone_id, undefined, 'should be undefined');
    t.deepEquals(errorsAndWarnings, {
      errors: ['tariff_zone_id: Invalid parameter type, expecting: number, got NaN: 123b'],
      warnings: []
    }, 'no warnings or errors');
    t.end();
  });

  test('configured addendum_namespace of type boolean with correct value, should return no errors and warnings', function (t) {
    const raw = { tariff_zone: 'true' };
    const clean = {};
    const sanitizer = proxyquire('../../../sanitizer/_addendum', {
      'pelias-config': makePeliasConfig({
        tariff_zone: {
          type: 'boolean'
        }
      })
    });
    const errorsAndWarnings = sanitizer().sanitize(raw, clean);
    t.deepEquals(clean.tariff_zone, true, 'should be a valid boolean value');
    t.deepEquals(errorsAndWarnings, { errors: [], warnings: [] }, 'no warnings or errors');
    t.end();
  });

  test('configured addendum_namespace of type boolean with incorrect value, should return error', function (t) {
    const raw = { tariff_zone: 'true123' };
    const clean = {};
    const sanitizer = proxyquire('../../../sanitizer/_addendum', {
      'pelias-config': makePeliasConfig({
        tariff_zone: {
          type: 'boolean'
        }
      })
    });
    const errorsAndWarnings = sanitizer().sanitize(raw, clean);
    t.deepEquals(clean.tariff_zone, undefined, 'should be undefined');
    t.deepEquals(
      errorsAndWarnings,
      { errors: ['tariff_zone: Invalid parameter type, expecting: boolean, got: true123'], warnings: [] },
      'no warnings or errors');
    t.end();
  });

  test('configured addendum_namespace of type object with correct value, should return no errors and warnings', function (t) {
    const raw = { tariff_zone: '{\"a\":\"b\"}' };
    const clean = {};
    const sanitizer = proxyquire('../../../sanitizer/_addendum', {
      'pelias-config': makePeliasConfig({
        tariff_zone: {
          type: 'object'
        }
      })
    });
    const errorsAndWarnings = sanitizer().sanitize(raw, clean);
    t.deepEquals(clean.tariff_zone, { 'a': 'b' }, 'should be valid object');
    t.deepEquals(errorsAndWarnings, { errors: [], warnings: [] }, 'no warnings or errors');
    t.end();
  });

  test('configured addendum_namespace of type object with incorrect value, should return error', function (t) {
    const raw = { tariff_zone: '{\"a\":\"b\"' };
    const clean = {};
    const sanitizer = proxyquire('../../../sanitizer/_addendum', {
      'pelias-config': makePeliasConfig({
        tariff_zone: {
          type: 'object'
        }
      })
    });
    const errorsAndWarnings = sanitizer().sanitize(raw, clean);
    t.deepEquals(clean.tariff_zone, undefined, 'should be undefined');
    t.deepEquals(
      errorsAndWarnings,
      {
        errors: ['tariff_zone: Invalid parameter type, expecting: object, got invalid JSON: {"a":"b"'],
        warnings: []
      },
      'no warnings or errors');
    t.end();
  });

  test('configured addendum_namespace of type object with array value, should return error', function (t) {
    const raw = { tariff_zone: '[1,2,3]' };
    const clean = {};
    const sanitizer = proxyquire('../../../sanitizer/_addendum', {
      'pelias-config': makePeliasConfig({
        tariff_zone: {
          type: 'object'
        }
      })
    });
    const errorsAndWarnings = sanitizer().sanitize(raw, clean);
    t.deepEquals(clean.tariff_zone, undefined, 'should be undefined');
    t.deepEquals(
      errorsAndWarnings,
      {
        errors: ['tariff_zone: Invalid parameter type, expecting: object, got array: [1,2,3]'],
        warnings: []
      },
      'no warnings or errors');
    t.end();
  });

  test('configured addendum_namespace of type object with non object value, should return error', function (t) {
    const raw = { tariff_zone: 'anyStringOrNumber' };
    const clean = {};
    const sanitizer = proxyquire('../../../sanitizer/_addendum', {
      'pelias-config': makePeliasConfig({
        tariff_zone: {
          type: 'object'
        }
      })
    });
    const errorsAndWarnings = sanitizer().sanitize(raw, clean);
    t.deepEquals(clean.tariff_zone, undefined, 'should be undefined');
    t.deepEquals(
      errorsAndWarnings,
      {
        errors: ['tariff_zone: Invalid parameter type, expecting: object, got invalid JSON: anyStringOrNumber'],
        warnings: []
      },
      'no warnings or errors');
    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('SANITIZE _addendum ' + name, testFunction);
  }

  for (var testCase in module.exports.tests) {
    module.exports.tests[testCase](test, common);
  }
};
