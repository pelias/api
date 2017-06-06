const sanitize = require('../../../sanitizer/_geo_reverse');
const defaults = require('../../../query/reverse_defaults');

module.exports.tests = {};

module.exports.tests.warning_situations = (test, common) => {
  test('raw with boundary.circle.lat should add warning about ignored boundary.circle', (t) => {
    const raw = {
      'point.lat': '12.121212',
      'point.lon': '21.212121',
      'boundary.circle.lat': '13.131313'
    };
    const clean = {};
    const errorsAndWarnings = sanitize(raw, clean);

    t.equals(clean['boundary.circle.lat'], 12.121212, 'should be set to point.lat');
    t.deepEquals(errorsAndWarnings, {
      errors: [],
      warnings: ['boundary.circle.lat/boundary.circle.lon are currently unsupported']
    }, 'no warnings/errors');
    t.end();

  });

  test('raw with boundary.circle.lon should add warning about ignored boundary.circle', (t) => {
    const raw = {
      'point.lat': '12.121212',
      'point.lon': '21.212121',
      'boundary.circle.lon': '31.313131'
    };
    const clean = {};
    const errorsAndWarnings = sanitize(raw, clean);

    t.equals(clean['boundary.circle.lon'], 21.212121, 'should be set to point.lon');
    t.deepEquals(errorsAndWarnings, {
      errors: [],
      warnings: ['boundary.circle.lat/boundary.circle.lon are currently unsupported']
    }, 'no warnings/errors');
    t.end();

  });

  test('raw with boundary.circle.radius shouldn\'t add warning about ignored boundary.circle', (t) => {
    const raw = {
      'point.lat': '12.121212',
      'point.lon': '21.212121',
      'boundary.circle.radius': '17'
    };
    const clean = {};
    const errorsAndWarnings = sanitize(raw, clean);

    // t.equals(clean['boundary.circle.radius'], 12.121212, 'should be set to point.lat')
    t.deepEquals(errorsAndWarnings, {
      errors: [],
      warnings: []
    }, 'no warnings/errors');
    t.end();

  });

};

module.exports.tests.non_coarse_reverse = (test, common) => {
  test('boundary.circle.lat/lon should be overridden with point.lat/lon when non-coarse layers', (t) => {
    [[], ['venue', 'locality'], ['address', 'county'], ['street', 'country']].forEach((layers) => {
      const raw = {
        'point.lat': '12.121212',
        'point.lon': '21.212121',
        'boundary.circle.lat': '13.131313',
        'boundary.circle.lon': '31.313131'
      };
      const clean = {
        layers: layers
      };
      const errorsAndWarnings = sanitize(raw, clean);

      t.equals(raw['boundary.circle.lat'], 12.121212, 'should be set to point.lat');
      t.equals(raw['boundary.circle.lon'], 21.212121, 'should be set to point.lon');
      t.equals(clean['boundary.circle.lat'], 12.121212, 'should be set to point.lat');
      t.equals(clean['boundary.circle.lon'], 21.212121, 'should be set to point.lon');

    });

    t.end();

  });

  test('no boundary.circle.radius supplied should be set to default when non-coarse layers', (t) => {
    [[], ['venue', 'locality'], ['address', 'county'], ['street', 'country']].forEach((layers) => {
      const raw = {
        'point.lat': '12.121212',
        'point.lon': '21.212121'
      };
      const clean = {
        layers: layers
      };
      const errorsAndWarnings = sanitize(raw, clean);

      t.equals(raw['boundary.circle.radius'], defaults['boundary:circle:radius'], 'should be from defaults');
      t.equals(clean['boundary.circle.radius'], parseFloat(defaults['boundary:circle:radius']), 'should be same as raw');

    });

    t.end();

  });

  test('explicit boundary.circle.radius should be used instead of default', (t) => {
    [[], ['venue', 'locality'], ['address', 'county'], ['street', 'country']].forEach((layers) => {
      const raw = {
        'point.lat': '12.121212',
        'point.lon': '21.212121',
        'boundary.circle.radius': '3248732857km' // this will never be the default
      };
      const clean = {
        layers: layers
      };
      const errorsAndWarnings = sanitize(raw, clean);

      t.equals(raw['boundary.circle.radius'], '3248732857km', 'should be parsed float');
      t.equals(clean['boundary.circle.radius'], 3248732857.0, 'should be copied from raw');

    });

    t.end();

  });

};

module.exports.tests.coarse_reverse = (test, common) => {
  test('coarse layers should not set boundary.circle things since they\'re not applicable', (t) => {
    ['coarse', 'neighbourhood', 'borough', 'locality', 'localadmin', 'county',
      'macrocounty', 'region', 'macroregion', 'dependency', 'country'].forEach((layer) => {
        const raw = {
          'point.lat': '12.121212',
          'point.lon': '21.212121'
        };
        const clean = { layers: [layer] };
        const errorsAndWarnings = sanitize(raw, clean);

        t.notOk(raw['boundary.circle.lat']);
        t.notOk(raw['boundary.circle.lon']);
        t.notOk(raw['boundary.circle.radius']);
        t.notOk(clean['boundary.circle.lat']);
        t.notOk(clean['boundary.circle.lon']);
        t.notOk(clean['boundary.circle.radius']);

        t.deepEquals(errorsAndWarnings, { errors: [], warnings: [] });

    });

    t.end();

  });

  test('coarse layers should not use explicit boundary.circle.radius since it\'s not applicable', (t) => {
    ['coarse', 'neighbourhood', 'borough', 'locality', 'localadmin', 'county',
      'macrocounty', 'region', 'macroregion', 'dependency', 'country'].forEach((layer) => {
        const raw = {
          'point.lat': '12.121212',
          'point.lon': '21.212121',
          'boundary.circle.radius': '3248732857km' // this will never be the default
        };
        const clean = { layers: [layer] };
        const errorsAndWarnings = sanitize(raw, clean);

        t.notOk(raw['boundary.circle.lat'], 'should not have been copied');
        t.notOk(raw['boundary.circle.lon'], 'should not have been copied');
        t.notOk(clean['boundary.circle.lat'], 'should not have been copied');
        t.notOk(clean['boundary.circle.lon'], 'should not have been copied');
        t.notOk(clean['boundary.circle.radius'], 'should not have been copied');

        t.deepEquals(errorsAndWarnings, { errors: [], warnings: [] });

    });

    t.end();

  });

};

module.exports.all = (tape, common) => {
  function test(name, testFunction) {
    return tape('SANTIZE _geo_reverse ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
