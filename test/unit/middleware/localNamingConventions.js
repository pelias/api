
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

  var req = {},
      middleware = localNamingConventions();

  test('flipNumberAndStreet', function(t) {
    var res = { results: { data: [ ukAddress, deAddress, nlAddress ] } };

    middleware( req, res, function next(){

      // GBR address should be a noop
      t.equal( res.results.data[0].name.default, '1 Main St', 'standard name' );

      // DEU address should have the housenumber and street name flipped
      // eg. '101 Grolmanstraße' -> 'Grolmanstraße 101'
      t.equal( res.results.data[1].name.default, 'Grolmanstraße 23', 'flipped name' );

      // NLD address should have the housenumber and street name flipped, too
      // this definition comes from pelias configuration
      t.equal( res.results.data[2].name.default, 'Keizersgracht 117', 'flipped name' );

      t.end();
    });
  });

  test('flipNumberAndStreet with array results', function(t) {
    var res = { results: [
      { data: [ ukAddress ] }, { data: [ deAddress, nlAddress ] }
    ] };

    middleware( req, res, function next(){

      // GBR address should be a noop
      t.equal( res.results[0].data[0].name.default, '1 Main St', 'standard name' );

      // DEU address should have the housenumber and street name flipped
      // eg. '101 Grolmanstraße' -> 'Grolmanstraße 101'
      t.equal( res.results[1].data[0].name.default, 'Grolmanstraße 23', 'flipped name' );

      // NLD address should have the housenumber and street name flipped, too
      // this definition comes from pelias configuration
      t.equal( res.results[1].data[1].name.default, 'Keizersgracht 117', 'flipped name' );

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
