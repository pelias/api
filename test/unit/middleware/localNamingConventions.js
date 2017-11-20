
var proxyquire = require('proxyquire');

var customConfig = {
  generate: function generate() {
    return {
      api : {
	localization : { // expand the set of flipped countries
	  flipNumberAndStreetCountries : ['NLD'] // Netherlands
	}
      }
    };
  }
};

var localNamingConventions = proxyquire('../../../middleware/localNamingConventions', { 'pelias-config': customConfig });

module.exports.tests = {};

// ref: https://github.com/pelias/pelias/issues/141
module.exports.tests.flipNumberAndStreet = function(test, common) {

  var ukAddress = {
    '_id': 'test1',
    '_type': 'test',
    'name': { 'default': '1 Main St' },
    'center_point': { 'lon': -7.131521, 'lat': 54.428866 },
    'address_parts': {
       'zip': 'BT77 0BG',
       'number': '1',
       'street': 'Main St'
    },
    'parent': {
      'region': ['Dungannon'],
      'country_a': ['GBR'],
      'country': ['United Kingdom']
    }
  };

  var deAddress = {
    '_id': 'test2',
    '_type': 'test',
    'name': { 'default': '23 Grolmanstraße' },
    'center_point': { 'lon': 13.321487, 'lat': 52.506781 },
    'address_parts': {
       'zip': '10623',
       'number': '23',
       'street': 'Grolmanstraße'
    },
    'parent': {
      'region': ['Berlin'],
      'locality': ['Berlin'],
      'country_a': ['DEU'],
      'county': ['Berlin'],
      'country': ['Germany'],
      'neighbourhood': ['Hansaviertel']
    }
  };

  var nlAddress = {
    '_id': 'test3',
    '_type': 'test',
    'name': { 'default': '117 Keizersgracht' },
    'center_point': { 'lon': 4.887545, 'lat': 52.376795 },
    'address_parts': {
       'zip': '1015',
       'number': '117',
       'street': 'Keizersgracht'
    },
    'parent': {
      'region': ['Amsterdam'],
      'locality': ['Amsterdam'],
      'country_a': ['NLD'],
      'county': ['Noord-Holland'],
      'country': ['Netherlands'],
      'neighbourhood': ['Grachtengordel-West']
    }
  };

  var unknownCountryAddress = {
    '_id': 'test4',
    '_type': 'test',
    'name': { 'default': '123 Main Street' },
    'center_point': { 'lon': 30.1, 'lat': -50 },
    'address_parts': {
       'number': '123',
       'street': 'Main Street'
    },
    'parent': {
    }
  };

  var dkAddressWithUnit = {
    '_id': 'test5',
    '_type': 'test',
    'name': { 'default': '26 Nikolaj Plads 2 th' },
    'center_point': { 'lon': 12.580921, 'lat': 55.678665 },
    'address_parts': {
       'zip': '1067',
       'unit': '2 th',
       'number': '26',
       'street': 'Nikolaj Plads'
    },
    'parent': {
      'region': ['København'],
      'locality': ['København K'],
      'country_a': ['DNK'],
      'county': ['Region Hovedstaden'],
      'country': ['Denmark']
    }
  };

  var req = {},
      res = { data: [ ukAddress, deAddress, nlAddress, unknownCountryAddress, dkAddressWithUnit ] },
      middleware = localNamingConventions();

  test('flipNumberAndStreet', function(t) {

    middleware( req, res, function next(){

      // GBR address should be a noop
      t.equal( res.data[0].name.default, '1 Main St', 'standard name' );

      // DEU address should have the housenumber and street name flipped
      // eg. '101 Grolmanstraße' -> 'Grolmanstraße 101'
      t.equal( res.data[1].name.default, 'Grolmanstraße 23', 'flipped name' );

      // NLD address should have the housenumber and street name flipped, too
      // this definition comes from pelias configuration
      t.equal( res.data[2].name.default, 'Keizersgracht 117', 'flipped name' );

      // addresses without a known country (either due to missing data or admin lookup
      // being disabled), don't have the name flipped
      t.equal( res.data[3].name.default, '123 Main Street', 'standard name');

      // DNK address should have the housenumber and street name flipped, too
      // this definition comes from pelias configuration
      // In this case address have unit and it should also be added to flipped address name
      t.equal( res.data[4].name.default, 'Nikolaj Plads 26 2 th', 'flipped name' );

      t.end();
    });
  });

};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('[middleware] localNamingConventions: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
