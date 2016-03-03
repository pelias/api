
var schemas = require('../../../helper/labelSchema');
var alpha3  = require('../mock/alpha3.json');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('interface', function(t) {
    t.equal(typeof schemas, 'object', 'valid object');
    t.equal(schemas.hasOwnProperty('default'), true, 'has default defined');
    t.end();
  });
};

module.exports.tests.supported_countries = function(test, common) {
  test('support countries', function(t) {
    var supported_countries = Object.keys(schemas);

    t.notEquals(supported_countries.indexOf('USA'), -1);
    t.notEquals(supported_countries.indexOf('GBR'), -1);
    t.notEquals(supported_countries.indexOf('SGP'), -1);
    t.notEquals(supported_countries.indexOf('SWE'), -1);
    t.notEquals(supported_countries.indexOf('default'), -1);
    t.equals(supported_countries.length, 5);

    t.equals(Object.keys(schemas.USA).length, 3);
    t.equals(Object.keys(schemas.GBR).length, 2);
    t.equals(Object.keys(schemas.SGP).length, 2);
    t.equals(Object.keys(schemas.SWE).length, 2);
    t.equals(Object.keys(schemas.default).length, 2);

    t.end();

  });
};

module.exports.tests.usa = function(test, common) {
  test('USA.local should use localadmin value over locality, neighbourhood, and county', function(t) {
    var record = {
      localadmin: 'localadmin value',
      locality: 'locality value',
      neighbourhood: 'neighbourhood value',
      county: 'county value'
    };

    var labelParts = ['initial value'];

    var f = schemas.USA.local;

    t.deepEqual(f(record, labelParts), ['initial value', 'localadmin value']);
    t.end();

  });

  test('USA.local should use locality value over neighbourhood and county when no localadmin', function(t) {
    var record = {
      locality: 'locality value',
      neighbourhood: 'neighbourhood value',
      county: 'county value'
    };

    var labelParts = ['initial value'];

    var f = schemas.USA.local;

    t.deepEqual(f(record, labelParts), ['initial value', 'locality value']);
    t.end();

  });

  test('USA.local should use neighbourhood value over county when no localadmin or locality', function(t) {
    var record = {
      neighbourhood: 'neighbourhood value',
      county: 'county value'
    };

    var labelParts = ['initial value'];

    var f = schemas.USA.local;

    t.deepEqual(f(record, labelParts), ['initial value', 'neighbourhood value']);
    t.end();

  });

  test('USA.local should use county value when no localadmin, locality, or neighbourhood', function(t) {
    var record = {
      county: 'county value'
    };

    var labelParts = ['initial value'];

    var f = schemas.USA.local;

    t.deepEqual(f(record, labelParts), ['initial value', 'county value']);
    t.end();

  });

  test('USA.local should not modify labelParts if none of localadmin, locality, neighbourhood, or county is available', function(t) {
    var record = {};

    var labelParts = ['initial value'];

    var f = schemas.USA.local;

    t.deepEqual(f(record, labelParts), ['initial value']);
    t.end();

  });

  test('USA.regional should use region when layer=region and region is available', function(t) {
    var record = {
      layer: 'region',
      region: 'region name',
      region_a: 'region_a name'
    };

    var labelParts = ['initial value'];

    var f = schemas.USA.regional;

    t.deepEqual(f(record, labelParts), ['initial value', 'region name']);
    t.end();

  });

  test('USA.regional should use region_a when layer=region and region is unavailable', function(t) {
    var record = {
      layer: 'region',
      region_a: 'region_a name'
    };

    var labelParts = ['initial value'];

    var f = schemas.USA.regional;

    t.deepEqual(f(record, labelParts), ['initial value', 'region_a name']);
    t.end();

  });

  test('USA.regional should use region_a when layer!=region and both region and region_a are available', function(t) {
    var record = {
      layer: 'not region',
      region: 'region name',
      region_a: 'region_a name'
    };

    var labelParts = ['initial value'];

    var f = schemas.USA.regional;

    t.deepEqual(f(record, labelParts), ['initial value', 'region_a name']);
    t.end();

  });

  test('USA.regional should use region when layer!=region and region_a is unavailable', function(t) {
    var record = {
      layer: 'region',
      region: 'region name',
      region_a: 'region_a name'
    };

    var labelParts = ['initial value'];

    var f = schemas.USA.regional;

    t.deepEqual(f(record, labelParts), ['initial value', 'region name'], 'region should have been appended');
    t.end();

  });

  test('USA.regional should not append anything when neither region nor region_a are available', function(t) {
    var record = {
      layer: 'region',
    };

    var labelParts = ['initial value'];

    var f = schemas.USA.regional;

    t.deepEqual(f(record, labelParts), ['initial value'], 'no USA.region should have appended');
    t.end();

  });

  test('USA.country should append country_a when available', function(t) {
    var record = {
      country_a: 'country_a name',
      country: 'country name'
    };

    var labelParts = ['initial value'];

    var f = schemas.USA.country;

    t.deepEqual(f(record, labelParts), ['initial value', 'country_a name'], 'country_a should have appended');
    t.end();

  });

  test('USA.country should not append anything when country_a is unavailable', function(t) {
    var record = {
      country: 'country name'
    };

    var labelParts = ['initial value'];

    var f = schemas.USA.country;

    t.deepEqual(f(record, labelParts), ['initial value'], 'no USA.country should have appended');
    t.end();

  });

};

module.exports.tests.gbr = function(test, common) {
  test('GBR.local should use neighbourhood value over county, localadmin, locality, region', function(t) {
    var record = {
      neighbourhood: 'neighbourhood value',
      county: 'county value',
      localadmin: 'localadmin value',
      locality: 'locality value',
      region: 'region value'
    };

    var labelParts = ['initial value'];

    var f = schemas.GBR.local;

    t.deepEqual(f(record, labelParts), ['initial value', 'neighbourhood value']);
    t.end();

  });

  test('GBR.local should use county value over county, localadmin, locality, region', function(t) {
    var record = {
      county: 'county value',
      localadmin: 'localadmin value',
      locality: 'locality value',
      region: 'region value'
    };

    var labelParts = ['initial value'];

    var f = schemas.GBR.local;

    t.deepEqual(f(record, labelParts), ['initial value', 'county value']);
    t.end();

  });

  test('GBR.local should use localadmin value over locality, region', function(t) {
    var record = {
      localadmin: 'localadmin value',
      locality: 'locality value',
      region: 'region value'
    };

    var labelParts = ['initial value'];

    var f = schemas.GBR.local;

    t.deepEqual(f(record, labelParts), ['initial value', 'localadmin value']);
    t.end();

  });

  test('GBR.local should use locality value over region', function(t) {
    var record = {
      locality: 'locality value',
      region: 'region value'
    };

    var labelParts = ['initial value'];

    var f = schemas.GBR.local;

    t.deepEqual(f(record, labelParts), ['initial value', 'locality value']);
    t.end();

  });

  test('GBR.local should use region value when nothing else is available', function(t) {
    var record = {
      region: 'region value'
    };

    var labelParts = ['initial value'];

    var f = schemas.GBR.local;

    t.deepEqual(f(record, labelParts), ['initial value', 'region value']);
    t.end();

  });

  test('GBR.local should not append anything when none of neighbourhood, county, localadmin, locality, region are available', function(t) {
    var record = {};

    var labelParts = ['initial value'];

    var f = schemas.GBR.local;

    t.deepEqual(f(record, labelParts), ['initial value']);
    t.end();

  });

  test('GBR.regional should use county over country and region', function(t) {
    var record = {
      county: 'county value',
      country: 'country value',
      region: 'region value'
    };

    var labelParts = ['initial value'];

    var f = schemas.GBR.regional;

    t.deepEqual(f(record, labelParts), ['initial value', 'county value']);
    t.end();

  });

  test('GBR.regional should use country over region', function(t) {
    var record = {
      country: 'country value',
      region: 'region value'
    };

    var labelParts = ['initial value'];

    var f = schemas.GBR.regional;

    t.deepEqual(f(record, labelParts), ['initial value', 'country value']);
    t.end();

  });

  test('GBR.regional should use region when county and country aren not available', function(t) {
    var record = {
      region: 'region value'
    };

    var labelParts = ['initial value'];

    var f = schemas.GBR.regional;

    t.deepEqual(f(record, labelParts), ['initial value', 'region value']);
    t.end();

  });

  test('GBR.regional should not append anything when none of county, country, or region are available', function(t) {
    var record = {};

    var labelParts = ['initial value'];

    var f = schemas.GBR.regional;

    t.deepEqual(f(record, labelParts), ['initial value']);
    t.end();

  });

};

module.exports.tests.sgp = function(test, common) {
  test('SGP.local should use neighbourhood value over region, county, localadmin, locality', function(t) {
    var record = {
      neighbourhood: 'neighbourhood value',
      county: 'county value',
      localadmin: 'localadmin value',
      locality: 'locality value',
      region: 'region value'
    };

    var labelParts = ['initial value'];

    var f = schemas.SGP.local;

    t.deepEqual(f(record, labelParts), ['initial value', 'neighbourhood value']);
    t.end();

  });

  test('SGP.local should use region value over county, localadmin, locality', function(t) {
    var record = {
      county: 'county value',
      localadmin: 'localadmin value',
      locality: 'locality value',
      region: 'region value'
    };

    var labelParts = ['initial value'];

    var f = schemas.SGP.local;

    t.deepEqual(f(record, labelParts), ['initial value', 'region value']);
    t.end();

  });

  test('SGP.local should use county value over localadmin, locality', function(t) {
    var record = {
      localadmin: 'localadmin value',
      locality: 'locality value',
      county: 'county value'
    };

    var labelParts = ['initial value'];

    var f = schemas.SGP.local;

    t.deepEqual(f(record, labelParts), ['initial value', 'county value']);
    t.end();

  });

  test('SGP.local should use localadmin value over locality', function(t) {
    var record = {
      localadmin: 'localadmin value',
      locality: 'locality value'
    };

    var labelParts = ['initial value'];

    var f = schemas.SGP.local;

    t.deepEqual(f(record, labelParts), ['initial value', 'localadmin value']);
    t.end();

  });

  test('SGP.local should use locality value when nothing else is available', function(t) {
    var record = {
      locality: 'locality value'
    };

    var labelParts = ['initial value'];

    var f = schemas.SGP.local;

    t.deepEqual(f(record, labelParts), ['initial value', 'locality value']);
    t.end();

  });

  test('SGP.local should not append anything when none of neighbourhood, region, county, localadmin, locality are available', function(t) {
    var record = {};

    var labelParts = ['initial value'];

    var f = schemas.SGP.local;

    t.deepEqual(f(record, labelParts), ['initial value']);
    t.end();

  });

  test('SGP.regional should use county over country and region', function(t) {
    var record = {
      county: 'county value',
      country: 'country value',
      region: 'region value'
    };

    var labelParts = ['initial value'];

    var f = schemas.SGP.regional;

    t.deepEqual(f(record, labelParts), ['initial value', 'county value']);
    t.end();

  });

  test('SGP.regional should use country over region', function(t) {
    var record = {
      country: 'country value',
      region: 'region value'
    };

    var labelParts = ['initial value'];

    var f = schemas.SGP.regional;

    t.deepEqual(f(record, labelParts), ['initial value', 'country value']);
    t.end();

  });

  test('SGP.regional should use region when county and country aren not available', function(t) {
    var record = {
      region: 'region value'
    };

    var labelParts = ['initial value'];

    var f = schemas.SGP.regional;

    t.deepEqual(f(record, labelParts), ['initial value', 'region value']);
    t.end();

  });

  test('SGP.regional should not append anything when none of county, country, or region are available', function(t) {
    var record = {};

    var labelParts = ['initial value'];

    var f = schemas.SGP.regional;

    t.deepEqual(f(record, labelParts), ['initial value']);
    t.end();

  });

};

module.exports.tests.swe = function(test, common) {
  test('SWE.local should use neighbourhood value over region, county, localadmin, locality', function(t) {
    var record = {
      neighbourhood: 'neighbourhood value',
      county: 'county value',
      localadmin: 'localadmin value',
      locality: 'locality value',
      region: 'region value'
    };

    var labelParts = ['initial value'];

    var f = schemas.SWE.local;

    t.deepEqual(f(record, labelParts), ['initial value', 'neighbourhood value']);
    t.end();

  });

  test('SWE.local should use region value over county, localadmin, locality', function(t) {
    var record = {
      county: 'county value',
      localadmin: 'localadmin value',
      locality: 'locality value',
      region: 'region value'
    };

    var labelParts = ['initial value'];

    var f = schemas.SWE.local;

    t.deepEqual(f(record, labelParts), ['initial value', 'region value']);
    t.end();

  });

  test('SWE.local should use county value over localadmin, locality', function(t) {
    var record = {
      localadmin: 'localadmin value',
      locality: 'locality value',
      county: 'county value'
    };

    var labelParts = ['initial value'];

    var f = schemas.SWE.local;

    t.deepEqual(f(record, labelParts), ['initial value', 'county value']);
    t.end();

  });

  test('SWE.local should use localadmin value over locality', function(t) {
    var record = {
      localadmin: 'localadmin value',
      locality: 'locality value'
    };

    var labelParts = ['initial value'];

    var f = schemas.SWE.local;

    t.deepEqual(f(record, labelParts), ['initial value', 'localadmin value']);
    t.end();

  });

  test('SWE.local should use locality value when nothing else is available', function(t) {
    var record = {
      locality: 'locality value'
    };

    var labelParts = ['initial value'];

    var f = schemas.SWE.local;

    t.deepEqual(f(record, labelParts), ['initial value', 'locality value']);
    t.end();

  });

  test('SWE.local should not append anything when none of neighbourhood, region, county, localadmin, locality are available', function(t) {
    var record = {};

    var labelParts = ['initial value'];

    var f = schemas.SWE.local;

    t.deepEqual(f(record, labelParts), ['initial value']);
    t.end();

  });

  test('SGP.regional should use country when available', function(t) {
    var record = {
      country: 'country value',
      country_a: 'country_a value',
    };

    var labelParts = ['initial value'];

    var f = schemas.SGP.regional;

    t.deepEqual(f(record, labelParts), ['initial value', 'country value']);
    t.end();

  });

  test('SGP.regional should not append anything when country is not available', function(t) {
    var record = {
      country_a: 'country_a value'
    };

    var labelParts = ['initial value'];

    var f = schemas.SGP.regional;

    t.deepEqual(f(record, labelParts), ['initial value']);
    t.end();

  });

};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('schemas: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
