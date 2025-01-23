const mapFields = require('../../../middleware/mapFields')();

module.exports.tests = {};

module.exports.tests.mapFields = function(test, common) {

  test('rename address_parts', function(t) {
    const req = {};
    const res = {
      data: [{
        address_parts: {
          unit: 'unit value',
          number: 'number value',
          zip: 'zip value',
          street: 'street value'
        }
      }]
    };

    const expected = [{
      address_parts: {
        unit: 'unit value',
        number: 'number value',
        zip: 'zip value',
        street: 'street value'
      },
      unit: 'unit value',
      housenumber: 'number value',
      postalcode: 'zip value',
      street: 'street value'
    }];

    mapFields(req, res, () => {});
    t.deepEqual(res.data, expected);
    t.end();
  });

  test('merge parent properties', function(t) {
    const req = {};
    const res = {
      data: [{
        address_parts: {
          unit: 'unit value',
          number: 'number value',
          zip: 'zip value',
          street: 'street value'
        },
        parent: {
          ocean: 'parent ocean value',
          ocean_a: 'parent ocean_a value',
          ocean_id: 'parent ocean_id value',
          ocean_source: 'parent ocean_source value',
          marinearea: 'parent marinearea value',
          continent: 'parent continent value',
          empire: 'parent empire value',
          country: 'parent country value',
          dependency: 'parent dependency value',
          macroregion: 'parent macroregion value',
          region: 'parent region value',
          macrocounty: 'parent macrocounty value',
          county: 'parent county value',
          localadmin: 'parent localadmin value',
          locality: 'parent locality value',
          borough: 'parent borough value',
          neighbourhood: 'parent neighbourhood value',
          postalcode: 'parent postalcode value',
          postalcode_a: 'parent postalcode_a value',
          postalcode_id: 'parent postalcode_id value',
          postalcode_source: 'parent postalcode_source value'
        }
      }]
    };

    const expected = [{
      address_parts: {
        unit: 'unit value',
        number: 'number value',
        zip: 'zip value',
        street: 'street value'
      },
      parent: {
        ocean: 'parent ocean value',
        ocean_a: 'parent ocean_a value',
        ocean_id: 'parent ocean_id value',
        ocean_source: 'parent ocean_source value',
        marinearea: 'parent marinearea value',
        continent: 'parent continent value',
        empire: 'parent empire value',
        country: 'parent country value',
        dependency: 'parent dependency value',
        macroregion: 'parent macroregion value',
        region: 'parent region value',
        macrocounty: 'parent macrocounty value',
        county: 'parent county value',
        localadmin: 'parent localadmin value',
        locality: 'parent locality value',
        borough: 'parent borough value',
        neighbourhood: 'parent neighbourhood value',
        postalcode: 'parent postalcode value',
        postalcode_a: 'parent postalcode_a value',
        postalcode_id: 'parent postalcode_id value',
        postalcode_source: 'parent postalcode_source value'
      },

      ocean: 'parent ocean value',
      ocean_a: 'parent ocean_a value',
      ocean_gid: 'parent ocean_id value',
      ocean_source: 'parent ocean_source value',
      marinearea: 'parent marinearea value',
      marinearea_a: undefined,
      marinearea_gid: undefined,
      marinearea_source: undefined,
      continent: 'parent continent value',
      continent_a: undefined,
      continent_gid: undefined,
      continent_source: undefined,
      empire: 'parent empire value',
      empire_a: undefined,
      empire_gid: undefined,
      empire_source: undefined,
      country: 'parent country value',
      country_a: undefined,
      country_gid: undefined,
      country_source: undefined,
      dependency: 'parent dependency value',
      dependency_a: undefined,
      dependency_gid: undefined,
      dependency_source: undefined,
      macroregion: 'parent macroregion value',
      macroregion_a: undefined,
      macroregion_gid: undefined,
      macroregion_source: undefined,
      region: 'parent region value',
      region_a: undefined,
      region_gid: undefined,
      region_source: undefined,
      macrocounty: 'parent macrocounty value',
      macrocounty_a: undefined,
      macrocounty_gid: undefined,
      macrocounty_source: undefined,
      county: 'parent county value',
      county_a: undefined,
      county_gid: undefined,
      county_source: undefined,
      localadmin: 'parent localadmin value',
      localadmin_a: undefined,
      localadmin_gid: undefined,
      localadmin_source: undefined,
      locality: 'parent locality value',
      locality_a: undefined,
      locality_gid: undefined,
      locality_source: undefined,
      borough: 'parent borough value',
      borough_a: undefined,
      borough_gid: undefined,
      borough_source: undefined,
      neighbourhood: 'parent neighbourhood value',
      neighbourhood_a: undefined,
      neighbourhood_gid: undefined,
      neighbourhood_source: undefined,
      postalcode_a: 'parent postalcode_a value',
      postalcode_gid: 'parent postalcode_id value',
      postalcode_source: 'parent postalcode_source value',

      unit: 'unit value',
      housenumber: 'number value',
      postalcode: 'zip value',
      street: 'street value',
    }];

    mapFields(req, res, () => {});
    t.deepEqual(res.data, expected);
    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape(`[middleware] mapFields: ${name}`, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
