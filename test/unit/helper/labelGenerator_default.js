
var generator = require('../../../helper/labelGenerator');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('interface', function(t) {
    t.equal(typeof generator, 'function', 'valid function');
    t.end();
  });
};

// AUS state
module.exports.tests.new_south_wales = function(test, common) {
  test('new south wales', function(t) {
    var doc = {
      'name': 'New South Wales',
      'country_a': 'AUS',
      'country': 'Australia',
      'region': 'New South Wales'
    };
    t.equal(generator(doc),'New South Wales, Australia');
    t.end();
  });
};

// IND state
module.exports.tests.west_bengal = function(test, common) {
  test('west bengal', function(t) {
    var doc = {
      'name': 'West Bengal',
      'country_a': 'IND',
      'country': 'India',
      'region': 'West Bengal'
    };
    t.equal(generator(doc),'West Bengal, India');
    t.end();
  });
};

// IND city
module.exports.tests.bangalore = function(test, common) {
  test('bangalore', function(t) {
    var doc = {
      'name': 'Bangalore',
      'country_a': 'IND',
      'country': 'India',
      'region': 'Karnataka',
      'county': 'Bangalore',
      'locality': 'Bangalore'
    };
    t.equal(generator(doc),'Bangalore, Karnataka, India');
    t.end();
  });
};

// IND region of city
module.exports.tests.sarjapur = function(test, common) {
  test('Sarjapur', function(t) {
    var doc = {
      'name': 'Sarjapur',
      'country_a': 'IND',
      'country': 'India',
      'region': 'Karnataka'
    };
    t.equal(generator(doc),'Sarjapur, Karnataka, India');
    t.end();
  });
};

// IND region of city 2
module.exports.tests.bengaluru_east = function(test, common) {
  test('Bengaluru East', function(t) {
    var doc = {
      'name': 'Bengaluru East',
      'country_a': 'IND',
      'country': 'India',
      'region': 'Karnataka',
      'county': 'Bangalore',
      'locality': 'Bangalore',
      'neighbourhood': 'Fraser Town'
    };
    t.equal(generator(doc),'Bengaluru East, Bangalore, India');
    t.end();
  });
};

// AUS area
// https://en.wikipedia.org/wiki/Shire_of_Wellington
module.exports.tests.wellington_victoria = function(test, common) {
  test('Wellington, Victoria, Australia', function(t) {
    var doc = {
      'name': 'Wellington',
      'country_a': 'AUS',
      'country': 'Australia',
      'region': 'Victoria',
      'county': 'Wellington'
    };
    t.equal(generator(doc),'Wellington, Victoria, Australia');
    t.end();
  });
};

// IRQ region
module.exports.tests.arbil = function(test, common) {
  test('arbil', function(t) {
    var doc = {
      'name': 'Arbil',
      'country_a': 'IRQ',
      'country': 'Iraq',
      'region': 'Arbil'
    };
    t.equal(generator(doc),'Arbil, Iraq');
    t.end();
  });
};

// ESP city
module.exports.tests.madrid = function(test, common) {
  test('madrid', function(t) {
    var doc = {
      'name': 'Madrid',
      'country_a': 'ESP',
      'country': 'Spain',
      'region': 'Madrid'
    };
    t.equal(generator(doc),'Madrid, Spain');
    t.end();
  });
};

// DEU street address
module.exports.tests.one_grolmanstrasse = function(test, common) {
  test('one grolmanstrasse', function(t) {
    var doc = {
      'name': '1 Grolmanstraße',
      'housenumber': '1',
      'street': 'Grolmanstraße',
      'postalcode': '10623',
      'country_a': 'DEU',
      'country': 'Germany',
      'region': 'Berlin',
      'county': 'Berlin',
      'locality': 'Berlin',
      'neighbourhood': 'Halensee'
    };
    t.equal(generator(doc),'1 Grolmanstraße, Berlin, Germany');
    t.end();
  });
};

// NZD country
module.exports.tests.new_zealand = function(test, common) {
  test('new zealand', function(t) {
    var doc = {
      'name': 'New Zealand',
      'country_a': 'NZL',
      'country': 'New Zealand'
    };
    t.equal(generator(doc),'New Zealand');
    t.end();
  });
};

// IRL country
module.exports.tests.republic_of_ireland = function(test, common) {
  test('northern ireland', function(t) {
    var doc = {
      'name': 'Ireland',
      'country_a': 'IRL',
      'country': 'Ireland'
    };
    // !! this is not part of the UK !!
    t.equal(generator(doc),'Ireland');
    t.end();
  });
};

// THA province
module.exports.tests.krabi_province = function(test, common) {
  test('Krabi Provence', function(t) {
    var doc = {
      'name': 'Krabi',
      'country_a': 'THA',
      'country': 'Thailand',
      'region': 'Krabi'
    };
    t.equal(generator(doc),'Krabi, Thailand');
    t.end();
  });
};

// THA island
module.exports.tests.koh_lanta = function(test, common) {
  test('Koh Lanta', function(t) {
    var doc = {
      'name': 'Ko Lanta',
      'country_a': 'THA',
      'country': 'Thailand',
      'region': 'Krabi'
    };
    t.equal(generator(doc),'Ko Lanta, Krabi, Thailand');
    t.end();
  });
};

// NZD cafe
module.exports.tests.black_dog_cafe = function(test, common) {
  test('Black Dog Cafe', function(t) {
    var doc = {
      'name': 'Black Dog Cafe',
      'country_a': 'NZL',
      'country': 'New Zealand',
      'region': 'Auckland Region',
      'county': 'Auckland'
    };
    t.equal(generator(doc),'Black Dog Cafe, Auckland, New Zealand');
    t.end();
  });
};

// NZD cafe 2
module.exports.tests.beach_bablyon = function(test, common) {
  test('Beach Bablyon', function(t) {
    var doc = {
      'name': 'Beach Bablyon',
      'country_a': 'NZL',
      'country': 'New Zealand',
      'region': 'Wellington Region',
      'county': 'Wellington City',
      'locality': 'Wellington',
      'neighbourhood': 'Oriental Bay'
    };
    t.equal(generator(doc),'Beach Bablyon, Wellington, New Zealand');
    t.end();
  });
};

// NZD tourism
module.exports.tests.waiotapu = function(test, common) {
  test('Waiotapu', function(t) {
    var doc = {
      'name': 'Waiotapu',
      'country_a': 'NZL',
      'country': 'New Zealand',
      'region': 'Bay of Plenty',
      'county': 'Rotorua District'
    };
    t.equal(generator(doc),'Waiotapu, Rotorua District, New Zealand');
    t.end();
  });
};


module.exports.tests.non_us_or_ca_region = function(test, common) {
  test('geonames US', function(t) {
    var doc = {
      'name': 'Default Name',
      'country_a': 'XYZ',
      'country': 'Full Country Name',
      'region': 'Full Region Name',
      'layer': 'region',
      'source': 'geonames'
    };

    t.equal(generator(doc), 'Default Name, Full Region Name, Full Country Name');
    t.end();

  });

  test('whosonfirst US', function(t) {
    var doc = {
      'name': 'Default Name',
      'country_a': 'XYZ',
      'country': 'Full Country Name',
      'region': 'Full Region Name',
      'layer': 'region',
      'source': 'whosonfirst'
    };

    t.equal(generator(doc), 'Default Name, Full Region Name, Full Country Name');
    t.end();

  });

};

// macroregion
module.exports.tests.macroregion_trumps_region = function(test, common) {
  test('macroregion should trump region when none of localadmin, locality, neighbourhood, county are available', function(t) {
    var doc = {
      'name': 'Name',
      'country_a': 'Country abbreviation',
      'country': 'Country Name',
      'macroregion': 'Macroregion Name',
      'region': 'Region Name'
    };

    t.equal(generator(doc), 'Name, Macroregion Name, Country Name');
    t.end();

  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('label generator: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
