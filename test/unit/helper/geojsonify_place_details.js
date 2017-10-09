const geojsonify = require('../../../helper/geojsonify_place_details');

module.exports.tests = {};

module.exports.tests.geojsonify_place_details = (test, common) => {
  test('plain old string values should be copied verbatim, replacing old values', t => {
    const source = {
      housenumber: 'housenumber value',
      street: 'street value',
      postalcode: 'postalcode value',
      postalcode_gid: 'postalcode_gid value',
      match_type: 'match_type value',
      accuracy: 'accuracy value',
      country: 'country value',
      country_gid: 'country_gid value',
      country_a: 'country_a value',
      dependency: 'dependency value',
      dependency_gid: 'dependency_gid value',
      dependency_a: 'dependency_a value',
      macroregion: 'macroregion value',
      macroregion_gid: 'macroregion_gid value',
      macroregion_a: 'macroregion_a value',
      region: 'region value',
      region_gid: 'region_gid value',
      region_a: 'region_a value',
      macrocounty: 'macrocounty value',
      macrocounty_gid: 'macrocounty_gid value',
      macrocounty_a: 'macrocounty_a value',
      county: 'county value',
      county_gid: 'county_gid value',
      county_a: 'county_a value',
      localadmin: 'localadmin value',
      localadmin_gid: 'localadmin_gid value',
      localadmin_a: 'localadmin_a value',
      locality: 'locality value',
      locality_gid: 'locality_gid value',
      locality_a: 'locality_a value',
      borough: 'borough value',
      borough_gid: 'borough_gid value',
      borough_a: 'borough_a value',
      neighbourhood: 'neighbourhood value',
      neighbourhood_gid: 'neighbourhood_gid value',
      continent: 'continent value',
      continent_gid: 'continent_gid value',
      continent_a: 'continent_a value',
      ocean: 'ocean value',
      ocean_gid: 'ocean_gid value',
      ocean_a: 'ocean_a value',
      marinearea: 'marinearea value',
      marinearea_gid: 'marinearea_gid value',
      marinearea_a: 'marinearea_a value',
      label: 'label value'
    };

    const expected = {
      housenumber: 'housenumber value',
      street: 'street value',
      postalcode: 'postalcode value',
      postalcode_gid: 'postalcode_gid value',
      match_type: 'match_type value',
      accuracy: 'accuracy value',
      country: 'country value',
      country_gid: 'country_gid value',
      country_a: 'country_a value',
      dependency: 'dependency value',
      dependency_gid: 'dependency_gid value',
      dependency_a: 'dependency_a value',
      macroregion: 'macroregion value',
      macroregion_gid: 'macroregion_gid value',
      macroregion_a: 'macroregion_a value',
      region: 'region value',
      region_gid: 'region_gid value',
      region_a: 'region_a value',
      macrocounty: 'macrocounty value',
      macrocounty_gid: 'macrocounty_gid value',
      macrocounty_a: 'macrocounty_a value',
      county: 'county value',
      county_gid: 'county_gid value',
      county_a: 'county_a value',
      localadmin: 'localadmin value',
      localadmin_gid: 'localadmin_gid value',
      localadmin_a: 'localadmin_a value',
      locality: 'locality value',
      locality_gid: 'locality_gid value',
      locality_a: 'locality_a value',
      borough: 'borough value',
      borough_gid: 'borough_gid value',
      borough_a: 'borough_a value',
      neighbourhood: 'neighbourhood value',
      neighbourhood_gid: 'neighbourhood_gid value',
      continent: 'continent value',
      continent_gid: 'continent_gid value',
      continent_a: 'continent_a value',
      ocean: 'ocean value',
      ocean_gid: 'ocean_gid value',
      ocean_a: 'ocean_a value',
      marinearea: 'marinearea value',
      marinearea_gid: 'marinearea_gid value',
      marinearea_a: 'marinearea_a value',
      label: 'label value'
    };

    const actual = geojsonify({}, source);

    t.deepEqual(actual, expected);
    t.end();

  });

  test('\'empty\' string-type values should be output as \'\'', t => {
    [ [], {}, '', 17, true, null, undefined ].forEach(empty_value => {
      const source = {
        housenumber: empty_value,
        street: empty_value,
        postalcode: empty_value,
        postalcode_gid: empty_value,
        match_type: empty_value,
        accuracy: empty_value,
        country: empty_value,
        country_gid: empty_value,
        country_a: empty_value,
        dependency: empty_value,
        dependency_gid: empty_value,
        dependency_a: empty_value,
        macroregion: empty_value,
        macroregion_gid: empty_value,
        macroregion_a: empty_value,
        region: empty_value,
        region_gid: empty_value,
        region_a: empty_value,
        macrocounty: empty_value,
        macrocounty_gid: empty_value,
        macrocounty_a: empty_value,
        county: empty_value,
        county_gid: empty_value,
        county_a: empty_value,
        localadmin: empty_value,
        localadmin_gid: empty_value,
        localadmin_a: empty_value,
        locality: empty_value,
        locality_gid: empty_value,
        locality_a: empty_value,
        borough: empty_value,
        borough_gid: empty_value,
        borough_a: empty_value,
        neighbourhood: empty_value,
        neighbourhood_gid: empty_value,
        continent: empty_value,
        continent_gid: empty_value,
        continent_a: empty_value,
        ocean: empty_value,
        ocean_gid: empty_value,
        ocean_a: empty_value,
        marinearea: empty_value,
        marinearea_gid: empty_value,
        marinearea_a: empty_value,
        label: empty_value
      };
      const expected = {};

      const actual = geojsonify({}, source);

      t.deepEqual(actual, expected);

    });

    t.end();

  });

  test('source arrays should be copy first value', t => {
    const source = {
      housenumber: ['housenumber value 1', 'housenumber value 2'],
      street: ['street value 1', 'street value 2'],
      postalcode: ['postalcode value 1', 'postalcode value 2'],
      postalcode_gid: ['postalcode_gid value 1', 'postalcode_gid value 2'],
      match_type: ['match_type value 1', 'match_type value 2'],
      accuracy: ['accuracy value 1', 'accuracy value 2'],
      country: ['country value 1', 'country value 2'],
      country_gid: ['country_gid value 1', 'country_gid value 2'],
      country_a: ['country_a value 1', 'country_a value 2'],
      dependency: ['dependency value 1', 'dependency value 2'],
      dependency_gid: ['dependency_gid value 1', 'dependency_gid value 2'],
      dependency_a: ['dependency_a value 1', 'dependency_a value 2'],
      macroregion: ['macroregion value 1', 'macroregion value 2'],
      macroregion_gid: ['macroregion_gid value 1', 'macroregion_gid value 2'],
      macroregion_a: ['macroregion_a value 1', 'macroregion_a value 2'],
      region: ['region value 1', 'region value 2'],
      region_gid: ['region_gid value 1', 'region_gid value 2'],
      region_a: ['region_a value 1', 'region_a value 2'],
      macrocounty: ['macrocounty value 1', 'macrocounty value 2'],
      macrocounty_gid: ['macrocounty_gid value 1', 'macrocounty_gid value 2'],
      macrocounty_a: ['macrocounty_a value 1', 'macrocounty_a value 2'],
      county: ['county value 1', 'county value 2'],
      county_gid: ['county_gid value 1', 'county_gid value 2'],
      county_a: ['county_a value 1', 'county_a value 2'],
      localadmin: ['localadmin value 1', 'localadmin value 2'],
      localadmin_gid: ['localadmin_gid value 1', 'localadmin_gid value 2'],
      localadmin_a: ['localadmin_a value 1', 'localadmin_a value 2'],
      locality: ['locality value 1', 'locality value 2'],
      locality_gid: ['locality_gid value 1', 'locality_gid value 2'],
      locality_a: ['locality_a value 1', 'locality_a value 2'],
      borough: ['borough value 1', 'borough value 2'],
      borough_gid: ['borough_gid value 1', 'borough_gid value 2'],
      borough_a: ['borough_a value 1', 'borough_a value 2'],
      neighbourhood: ['neighbourhood value 1', 'neighbourhood value 2'],
      neighbourhood_gid: ['neighbourhood_gid value 1', 'neighbourhood_gid value 2'],
      continent: ['continent value 1', 'continent value 2'],
      continent_gid: ['continent_gid value 1', 'continent_gid value 2'],
      continent_a: ['continent_a value 1', 'continent_a value 2'],
      ocean: ['ocean value 1', 'ocean value 2'],
      ocean_gid: ['ocean_gid value 1', 'ocean_gid value 2'],
      ocean_a: ['ocean_a value 1', 'ocean_a value 2'],
      marinearea: ['marinearea value 1', 'marinearea value 2'],
      marinearea_gid: ['marinearea_gid value 1', 'marinearea_gid value 2'],
      marinearea_a: ['marinearea_a value 1','marinearea_a value 2'],
      label: ['label value 1', 'label value 2']
    };

    const expected = {
      housenumber: 'housenumber value 1',
      street: 'street value 1',
      postalcode: 'postalcode value 1',
      postalcode_gid: 'postalcode_gid value 1',
      match_type: 'match_type value 1',
      accuracy: 'accuracy value 1',
      country: 'country value 1',
      country_gid: 'country_gid value 1',
      country_a: 'country_a value 1',
      dependency: 'dependency value 1',
      dependency_gid: 'dependency_gid value 1',
      dependency_a: 'dependency_a value 1',
      macroregion: 'macroregion value 1',
      macroregion_gid: 'macroregion_gid value 1',
      macroregion_a: 'macroregion_a value 1',
      region: 'region value 1',
      region_gid: 'region_gid value 1',
      region_a: 'region_a value 1',
      macrocounty: 'macrocounty value 1',
      macrocounty_gid: 'macrocounty_gid value 1',
      macrocounty_a: 'macrocounty_a value 1',
      county: 'county value 1',
      county_gid: 'county_gid value 1',
      county_a: 'county_a value 1',
      localadmin: 'localadmin value 1',
      localadmin_gid: 'localadmin_gid value 1',
      localadmin_a: 'localadmin_a value 1',
      locality: 'locality value 1',
      locality_gid: 'locality_gid value 1',
      locality_a: 'locality_a value 1',
      borough: 'borough value 1',
      borough_gid: 'borough_gid value 1',
      borough_a: 'borough_a value 1',
      neighbourhood: 'neighbourhood value 1',
      neighbourhood_gid: 'neighbourhood_gid value 1',
      continent: 'continent value 1',
      continent_gid: 'continent_gid value 1',
      continent_a: 'continent_a value 1',
      ocean: 'ocean value 1',
      ocean_gid: 'ocean_gid value 1',
      ocean_a: 'ocean_a value 1',
      marinearea: 'marinearea value 1',
      marinearea_gid: 'marinearea_gid value 1',
      marinearea_a: 'marinearea_a value 1',
      label: 'label value 1'
    };

    const actual = geojsonify({}, source);

    t.deepEqual(actual, expected);
    t.end();

  });

  test('non-empty objects should be converted to strings', t => {
    // THIS TEST SHOWS THAT THE CODE DOES NOT DO WHAT IT EXPECTED
    const source = {
      housenumber: { housenumber: 'housenumber value'},
      street: { street: 'street value'},
      postalcode: { postalcode: 'postalcode value'},
      postalcode_gid: { postalcode_gid: 'postalcode_gid value'},
      match_type: { match_type: 'match_type value'},
      accuracy: { accuracy: 'accuracy value'},
      country: { country: 'country value'},
      country_gid: { country_gid: 'country_gid value'},
      country_a: { country_a: 'country_a value'},
      dependency: { dependency: 'dependency value'},
      dependency_gid: { dependency_gid: 'dependency_gid value'},
      dependency_a: { dependency_a: 'dependency_a value'},
      macroregion: { macroregion: 'macroregion value'},
      macroregion_gid: { macroregion_gid: 'macroregion_gid value'},
      macroregion_a: { macroregion_a: 'macroregion_a value'},
      region: { region: 'region value'},
      region_gid: { region_gid: 'region_gid value'},
      region_a: { region_a: 'region_a value'},
      macrocounty: { macrocounty: 'macrocounty value'},
      macrocounty_gid: { macrocounty_gid: 'macrocounty_gid value'},
      macrocounty_a: { macrocounty_a: 'macrocounty_a value'},
      county: { county: 'county value'},
      county_gid: { county_gid: 'county_gid value'},
      county_a: { county_a: 'county_a value'},
      localadmin: { localadmin: 'localadmin value'},
      localadmin_gid: { localadmin_gid: 'localadmin_gid value'},
      localadmin_a: { localadmin_a: 'localadmin_a value'},
      locality: { locality: 'locality value'},
      locality_gid: { locality_gid: 'locality_gid value'},
      locality_a: { locality_a: 'locality_a value'},
      borough: { borough: 'borough value'},
      borough_gid: { borough_gid: 'borough_gid value'},
      borough_a: { borough_a: 'borough_a value'},
      neighbourhood: { neighbourhood: 'neighbourhood value'},
      neighbourhood_gid: { neighbourhood_gid: 'neighbourhood_gid value'},
      continent: { continent: 'continent value'} ,
      continent_gid: { continent: 'continent_gid value'},
      continent_a: { continent: 'continent_a value'},
      ocean: { ocean: 'ocean value'},
      ocean_gid: { ocean_gid: 'ocean_gid value'},
      ocean_a: { ocean_a: 'ocean_a value'},
      marinearea: { marinearea: 'marinearea value'},
      marinearea_gid: { marinearea_gid: 'marinearea_gid value'},
      marinearea_a: { marinearea_a: 'marinearea_a value'},
      label: { label: 'label value'}
    };

    const expected = {
      housenumber: '[object Object]',
      street: '[object Object]',
      postalcode: '[object Object]',
      postalcode_gid: '[object Object]',
      match_type: '[object Object]',
      accuracy: '[object Object]',
      country: '[object Object]',
      country_gid: '[object Object]',
      country_a: '[object Object]',
      dependency: '[object Object]',
      dependency_gid: '[object Object]',
      dependency_a: '[object Object]',
      macroregion: '[object Object]',
      macroregion_gid: '[object Object]',
      macroregion_a: '[object Object]',
      region: '[object Object]',
      region_gid: '[object Object]',
      region_a: '[object Object]',
      macrocounty: '[object Object]',
      macrocounty_gid: '[object Object]',
      macrocounty_a: '[object Object]',
      county: '[object Object]',
      county_gid: '[object Object]',
      county_a: '[object Object]',
      localadmin: '[object Object]',
      localadmin_gid: '[object Object]',
      localadmin_a: '[object Object]',
      locality: '[object Object]',
      locality_gid: '[object Object]',
      locality_a: '[object Object]',
      borough: '[object Object]',
      borough_gid: '[object Object]',
      borough_a: '[object Object]',
      neighbourhood: '[object Object]',
      neighbourhood_gid: '[object Object]',
      continent: '[object Object]',
      continent_gid: '[object Object]',
      continent_a: '[object Object]',
      ocean: '[object Object]',
      ocean_gid: '[object Object]',
      ocean_a: '[object Object]',
      marinearea: '[object Object]',
      marinearea_gid: '[object Object]',
      marinearea_a: '[object Object]',
      label: '[object Object]'
    };

    const actual = geojsonify({}, source);

    t.deepEqual(actual, expected);
    t.end();

  });

  test('\'default\'-type properties should be copied without type conversion and overwrite old values', t => {
    [ 'this is a string', 17.3, { a: 1 }, [1, 2, 3] ].forEach(value => {
      const source = {
        confidence: value,
        distance: value,
        bounding_box: value
      };

      const expected = {
        confidence: value,
        distance: value,
        bounding_box: value
      };

      const actual = geojsonify({}, source);

      t.deepEqual(actual, expected);

    });

    t.end();

  });

  test('\'default\'-type properties that are numbers should be output as numbers', t => {
    [ 17, 17.3 ].forEach(value => {
      const source = {
        confidence: value,
        distance: value,
        bounding_box: value
      };
      const expected = {
        confidence: value,
        distance: value,
        bounding_box: value
      };

      const actual = geojsonify({}, source);

      t.deepEqual(actual, expected);

    });

    t.end();

  });

  test('\'empty\' values for default-type properties should not be output', t => {
    [ undefined, null, true, {}, [] ].forEach(value => {
      const source = {
        confidence: value,
        distance: value,
        bounding_box: value
      };
      const expected = {};

      const actual = geojsonify({}, source);

      t.deepEqual(actual, expected);

    });

    t.end();

  });

  test('array-type properties should not be output when empty', t => {
    const source = {
      category: []
    };
    const expected = {};

    const actual = geojsonify({}, source);

    t.deepEqual(actual, expected);
    t.end();

  });

  test('array-type properties with array values should be output as arrays', t => {
    const source = {
      category: [ 1, 2 ]
    };
    const expected = {
      category: [ 1, 2 ]
    };

    const clean = {
      categories: true
    };

    const actual = geojsonify(clean, source);

    t.deepEqual(actual, expected);
    t.end();

  });

  test('category property should be output when params contains \'category\' property', t => {
    [ {a: 1}, 'this is a string'].forEach(value => {
      const source = {
        category: value
      };
      const expected = {
        category: [ value ]
      };

      const clean = {
        categories: true
      };

      const actual = geojsonify(clean, source);

      t.deepEqual(actual, expected);

    });

    t.end();

  });

  test('category property should not be output when params does not contain \'category\' property', t => {
    const source = {
      category: [ 1, 2 ]
    };
    const expected = {
    };

    const clean = {};

    const actual = geojsonify(clean, source);

    t.deepEqual(actual, expected);
    t.end();

  });

  test('category property should not be output when params is not an object', t => {
    const source = {
      category: [ 1, 2 ]
    };
    const expected = {
    };

    const clean = 'this is not an object';

    const actual = geojsonify(clean, source);

    t.deepEqual(actual, expected);
    t.end();

  });

};

module.exports.tests.empire_specific = (test, common) => {
  test('empire* properties should not be output when country_gid property is available', t => {
    const source = {
      country_gid: 'country_gid value',
      empire: 'empire value',
      empire_gid: 'empire_gid value',
      empire_a: 'empire_a value',
      label: 'label value'
    };

    const expected = {
      country_gid: 'country_gid value',
      label: 'label value'
    };

    const actual = geojsonify({}, source);

    t.deepEqual(actual, expected);
    t.end();

  });

  test('empire* properties should be output when country_gid property is not available', t => {
    const source = {
      empire: 'empire value',
      empire_gid: 'empire_gid value',
      empire_a: 'empire_a value',
      label: 'label value'
    };

    const expected = {
      empire: 'empire value',
      empire_gid: 'empire_gid value',
      empire_a: 'empire_a value',
      label: 'label value'
    };

    const actual = geojsonify({}, source);

    t.deepEqual(actual, expected);
    t.end();

  });

};

module.exports.all = (tape, common) => {

  function test(name, testFunction) {
    return tape(`geojsonify: ${name}`, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
