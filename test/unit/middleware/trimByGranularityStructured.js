var trimByGranularity = require('../../../middleware/trimByGranularityStructured')();

module.exports.tests = {};

module.exports.tests.trimByGranularity = function(test, common) {
  test('empty res and req should not throw exception', function(t) {
    function testIt() {
      trimByGranularity({}, {}, function() {});
    }

    t.doesNotThrow(testIt, 'an exception should not have been thrown');
    t.end();
  });

  test('all records with fallback.* matched_queries name should retain only venues when they are most granular', function(t) {
    var req = { clean: {} };

    var res = {
      data: [
        { name: 'venue 1', _matched_queries: ['fallback.venue'] },
        { name: 'venue 2', _matched_queries: ['fallback.venue'] },
        { name: 'address 1', _matched_queries: ['fallback.address'] },
        { name: 'street 1', _matched_queries: ['fallback.street'] },
        { name: 'postalcode 1', _matched_queries: ['fallback.postalcode'] },
        { name: 'neighbourhood 1', _matched_queries: ['fallback.neighbourhood'] },
        { name: 'borough 1', _matched_queries: ['fallback.borough'] },
        { name: 'locality 1', _matched_queries: ['fallback.locality'] },
        { name: 'localadmin 1', _matched_queries: ['fallback.localadmin'] },
        { name: 'county 1', _matched_queries: ['fallback.county'] },
        { name: 'macrocounty 1', _matched_queries: ['fallback.macrocounty'] },
        { name: 'region 1', _matched_queries: ['fallback.region'] },
        { name: 'macroregion 1', _matched_queries: ['fallback.macroregion'] },
        { name: 'dependency 1', _matched_queries: ['fallback.dependency'] },
        { name: 'country 1', _matched_queries: ['fallback.country'] },
        { name: 'unknown', _matched_queries: ['fallback.unknown'] }
      ]
    };

    var expected_data = [
      { name: 'venue 1', _matched_queries: ['fallback.venue'] },
      { name: 'venue 2', _matched_queries: ['fallback.venue'] },
    ];

    function testIt() {
      trimByGranularity(req, res, function() {
        t.deepEquals(res.data, expected_data, 'only venue records should be here');
        t.end();
      });
    }

    testIt();
  });

  test('all records with fallback.* matched_queries name should retain only streets when they are most granular', function(t) {
    var req = { clean: {} };

    var res = {
      data: [
        { name: 'address 1', _matched_queries: ['fallback.address'] },
        { name: 'address 2', _matched_queries: ['fallback.address'] },
        { name: 'street 1', _matched_queries: ['fallback.street'] },
        { name: 'postalcode 1', _matched_queries: ['fallback.postalcode'] },
        { name: 'neighbourhood 1', _matched_queries: ['fallback.neighbourhood'] },
        { name: 'borough 1', _matched_queries: ['fallback.borough'] },
        { name: 'locality 1', _matched_queries: ['fallback.locality'] },
        { name: 'localadmin 1', _matched_queries: ['fallback.localadmin'] },
        { name: 'county 1', _matched_queries: ['fallback.county'] },
        { name: 'macrocounty 1', _matched_queries: ['fallback.macrocounty'] },
        { name: 'region 1', _matched_queries: ['fallback.region'] },
        { name: 'macroregion 1', _matched_queries: ['fallback.macroregion'] },
        { name: 'dependency 1', _matched_queries: ['fallback.dependency'] },
        { name: 'country 1', _matched_queries: ['fallback.country'] },
        { name: 'unknown', _matched_queries: ['fallback.unknown'] }
      ]
    };

    var expected_data = [
      { name: 'address 1', _matched_queries: ['fallback.address'] },
      { name: 'address 2', _matched_queries: ['fallback.address'] }
    ];

    function testIt() {
      trimByGranularity(req, res, function() {
        t.deepEquals(res.data, expected_data, 'only address records should be here');
        t.end();
      });
    }

    testIt();
  });

  test('all records with fallback.* matched_queries name should retain only street when they are most granular', function(t) {
    var req = { clean: {} };

    var res = {
      data: [
        { name: 'street 1', _matched_queries: ['fallback.street'] },
        { name: 'street 2', _matched_queries: ['fallback.street'] },
        { name: 'postalcode 1', _matched_queries: ['fallback.postalcode'] },
        { name: 'neighbourhood 1', _matched_queries: ['fallback.neighbourhood'] },
        { name: 'borough 1', _matched_queries: ['fallback.borough'] },
        { name: 'locality 1', _matched_queries: ['fallback.locality'] },
        { name: 'localadmin 1', _matched_queries: ['fallback.localadmin'] },
        { name: 'county 1', _matched_queries: ['fallback.county'] },
        { name: 'macrocounty 1', _matched_queries: ['fallback.macrocounty'] },
        { name: 'region 1', _matched_queries: ['fallback.region'] },
        { name: 'macroregion 1', _matched_queries: ['fallback.macroregion'] },
        { name: 'dependency 1', _matched_queries: ['fallback.dependency'] },
        { name: 'country 1', _matched_queries: ['fallback.country'] },
        { name: 'unknown', _matched_queries: ['fallback.unknown'] }
      ]
    };

    var expected_data = [
      { name: 'street 1', _matched_queries: ['fallback.street'] },
      { name: 'street 2', _matched_queries: ['fallback.street'] },
    ];

    function testIt() {
      trimByGranularity(req, res, function() {
        t.deepEquals(res.data, expected_data, 'only street records should be here');
        t.end();
      });
    }

    testIt();
  });
    
  test('all records with fallback.* matched_queries name should retain only postalcodes when they are most granular', function(t) {
    var req = {
      clean: {
        parsed_text: {
          borough: 'borough value'
        }
      }
    };

    var res = {
      data: [
        { name: 'postalcode 1', _matched_queries: ['fallback.postalcode'] },
        { name: 'postalcode 2', _matched_queries: ['fallback.postalcode'] },
        { name: 'neighbourhood 1', _matched_queries: ['fallback.neighbourhood'] },
        { name: 'borough 1', _matched_queries: ['fallback.borough'] },
        { name: 'borough 2', _matched_queries: ['fallback.borough'] },
        { name: 'locality 1', _matched_queries: ['fallback.locality'] },
        { name: 'localadmin 1', _matched_queries: ['fallback.localadmin'] },
        { name: 'county 1', _matched_queries: ['fallback.county'] },
        { name: 'macrocounty 1', _matched_queries: ['fallback.macrocounty'] },
        { name: 'region 1', _matched_queries: ['fallback.region'] },
        { name: 'macroregion 1', _matched_queries: ['fallback.macroregion'] },
        { name: 'dependency 1', _matched_queries: ['fallback.dependency'] },
        { name: 'country 1', _matched_queries: ['fallback.country'] },
        { name: 'unknown', _matched_queries: ['fallback.unknown'] }
      ]
    };

    var expected_data = [
      { name: 'postalcode 1', _matched_queries: ['fallback.postalcode'] },
      { name: 'postalcode 2', _matched_queries: ['fallback.postalcode'] },
    ];

    function testIt() {
      trimByGranularity(req, res, function() {
        t.deepEquals(res.data, expected_data, 'only postalcode records should be here');
        t.end();
      });
    }

    testIt();
  });

  test('all records with fallback.* matched_queries name should retain only neighbourhoods when they are most granular', function(t) {
    var req = { clean: {} };

    var res = {
      data: [
        { name: 'neighbourhood 1', _matched_queries: ['fallback.neighbourhood'] },
        { name: 'neighbourhood 2', _matched_queries: ['fallback.neighbourhood'] },
        { name: 'borough 1', _matched_queries: ['fallback.borough'] },
        { name: 'locality 1', _matched_queries: ['fallback.locality'] },
        { name: 'localadmin 1', _matched_queries: ['fallback.localadmin'] },
        { name: 'county 1', _matched_queries: ['fallback.county'] },
        { name: 'macrocounty 1', _matched_queries: ['fallback.macrocounty'] },
        { name: 'region 1', _matched_queries: ['fallback.region'] },
        { name: 'macroregion 1', _matched_queries: ['fallback.macroregion'] },
        { name: 'dependency 1', _matched_queries: ['fallback.dependency'] },
        { name: 'country 1', _matched_queries: ['fallback.country'] },
        { name: 'unknown', _matched_queries: ['fallback.unknown'] }
      ]
    };

    var expected_data = [
      { name: 'neighbourhood 1', _matched_queries: ['fallback.neighbourhood'] },
      { name: 'neighbourhood 2', _matched_queries: ['fallback.neighbourhood'] },
    ];

    function testIt() {
      trimByGranularity(req, res, function() {
        t.deepEquals(res.data, expected_data, 'only neighbourhood records should be here');
        t.end();
      });
    }

    testIt();
  });

  test('all records with fallback.* matched_queries name should retain only boroughs when they are most granular', function(t) {
    var req = {
      clean: {
        parsed_text: {
          borough: 'borough value'
        }
      }
    };

    var res = {
      data: [
        { name: 'borough 1', _matched_queries: ['fallback.borough'] },
        { name: 'borough 2', _matched_queries: ['fallback.borough'] },
        { name: 'locality 1', _matched_queries: ['fallback.locality'] },
        { name: 'localadmin 1', _matched_queries: ['fallback.localadmin'] },
        { name: 'county 1', _matched_queries: ['fallback.county'] },
        { name: 'macrocounty 1', _matched_queries: ['fallback.macrocounty'] },
        { name: 'region 1', _matched_queries: ['fallback.region'] },
        { name: 'macroregion 1', _matched_queries: ['fallback.macroregion'] },
        { name: 'dependency 1', _matched_queries: ['fallback.dependency'] },
        { name: 'country 1', _matched_queries: ['fallback.country'] },
        { name: 'unknown', _matched_queries: ['fallback.unknown'] }
      ]
    };

    var expected_data = [
      { name: 'borough 1', _matched_queries: ['fallback.borough'] },
      { name: 'borough 2', _matched_queries: ['fallback.borough'] },
    ];

    function testIt() {
      trimByGranularity(req, res, function() {
        t.deepEquals(res.data, expected_data, 'only borough records should be here');
        t.end();
      });
    }

    testIt();
  });

  test('if req.parsed_text has city but not borough then borough and city results should be returned', function(t) {
    var req = {
      clean: {
        parsed_text: {
          city: 'city value'
        }
      }
    };

    var res = {
      data: [
        { name: 'borough 1', _matched_queries: ['fallback.borough'] },
        { name: 'borough 2', _matched_queries: ['fallback.borough'] },
        { name: 'locality 1', _matched_queries: ['fallback.locality'] },
        { name: 'locality 2', _matched_queries: ['fallback.locality'] },
        { name: 'localadmin 1', _matched_queries: ['fallback.localadmin'] },
        { name: 'county 1', _matched_queries: ['fallback.county'] },
        { name: 'macrocounty 1', _matched_queries: ['fallback.macrocounty'] },
        { name: 'region 1', _matched_queries: ['fallback.region'] },
        { name: 'macroregion 1', _matched_queries: ['fallback.macroregion'] },
        { name: 'dependency 1', _matched_queries: ['fallback.dependency'] },
        { name: 'country 1', _matched_queries: ['fallback.country'] },
        { name: 'unknown', _matched_queries: ['fallback.unknown'] }
      ]
    };

    var expected_data = [
      { name: 'borough 1', _matched_queries: ['fallback.borough'] },
      { name: 'borough 2', _matched_queries: ['fallback.borough'] },
      { name: 'locality 1', _matched_queries: ['fallback.locality'] },
      { name: 'locality 2', _matched_queries: ['fallback.locality'] }
    ];

    function testIt() {
      trimByGranularity(req, res, function() {
        t.deepEquals(res.data, expected_data, 'only borough/locality records should be here');
        t.end();
      });
    }

    testIt();
  });

  test('all records with fallback.* matched_queries name should retain only localities when they are most granular', function(t) {
    var req = { clean: {} };

    var res = {
      data: [
        { name: 'locality 1', _matched_queries: ['fallback.locality'] },
        { name: 'locality 2', _matched_queries: ['fallback.locality'] },
        { name: 'localadmin 1', _matched_queries: ['fallback.localadmin'] },
        { name: 'county 1', _matched_queries: ['fallback.county'] },
        { name: 'macrocounty 1', _matched_queries: ['fallback.macrocounty'] },
        { name: 'region 1', _matched_queries: ['fallback.region'] },
        { name: 'macroregion 1', _matched_queries: ['fallback.macroregion'] },
        { name: 'dependency 1', _matched_queries: ['fallback.dependency'] },
        { name: 'country 1', _matched_queries: ['fallback.country'] },
        { name: 'unknown', _matched_queries: ['fallback.unknown'] }
      ]
    };

    var expected_data = [
      { name: 'locality 1', _matched_queries: ['fallback.locality'] },
      { name: 'locality 2', _matched_queries: ['fallback.locality'] },
    ];

    function testIt() {
      trimByGranularity(req, res, function() {
        t.deepEquals(res.data, expected_data, 'only locality records should be here');
        t.end();
      });
    }

    testIt();
  });

  test('all records with fallback.* matched_queries name should retain only localadmins when they are most granular', function(t) {
    var req = { clean: {} };

    var res = {
      data: [
        { name: 'localadmin 1', _matched_queries: ['fallback.localadmin'] },
        { name: 'localadmin 2', _matched_queries: ['fallback.localadmin'] },
        { name: 'county 1', _matched_queries: ['fallback.county'] },
        { name: 'macrocounty 1', _matched_queries: ['fallback.macrocounty'] },
        { name: 'region 1', _matched_queries: ['fallback.region'] },
        { name: 'macroregion 1', _matched_queries: ['fallback.macroregion'] },
        { name: 'dependency 1', _matched_queries: ['fallback.dependency'] },
        { name: 'country 1', _matched_queries: ['fallback.country'] },
        { name: 'unknown', _matched_queries: ['fallback.unknown'] }
      ]
    };

    var expected_data = [
      { name: 'localadmin 1', _matched_queries: ['fallback.localadmin'] },
      { name: 'localadmin 2', _matched_queries: ['fallback.localadmin'] },
    ];

    function testIt() {
      trimByGranularity(req, res, function() {
        t.deepEquals(res.data, expected_data, 'only localadmin records should be here');
        t.end();
      });
    }

    testIt();
  });

  test('all records with fallback.* matched_queries name should retain only counties when they are most granular', function(t) {
    var req = { clean: {} };

    var res = {
      data: [
        { name: 'county 1', _matched_queries: ['fallback.county'] },
        { name: 'county 2', _matched_queries: ['fallback.county'] },
        { name: 'macrocounty 1', _matched_queries: ['fallback.macrocounty'] },
        { name: 'region 1', _matched_queries: ['fallback.region'] },
        { name: 'macroregion 1', _matched_queries: ['fallback.macroregion'] },
        { name: 'dependency 1', _matched_queries: ['fallback.dependency'] },
        { name: 'country 1', _matched_queries: ['fallback.country'] },
        { name: 'unknown', _matched_queries: ['fallback.unknown'] }
      ]
    };

    var expected_data = [
      { name: 'county 1', _matched_queries: ['fallback.county'] },
      { name: 'county 2', _matched_queries: ['fallback.county'] },
    ];

    function testIt() {
      trimByGranularity(req, res, function() {
        t.deepEquals(res.data, expected_data, 'only county records should be here');
        t.end();
      });
    }

    testIt();
  });

  test('all records with fallback.* matched_queries name should retain only macrocounties when they are most granular', function(t) {
    var req = { clean: {} };

    var res = {
      data: [
        { name: 'macrocounty 1', _matched_queries: ['fallback.macrocounty'] },
        { name: 'macrocounty 2', _matched_queries: ['fallback.macrocounty'] },
        { name: 'region 1', _matched_queries: ['fallback.region'] },
        { name: 'macroregion 1', _matched_queries: ['fallback.macroregion'] },
        { name: 'dependency 1', _matched_queries: ['fallback.dependency'] },
        { name: 'country 1', _matched_queries: ['fallback.country'] },
        { name: 'unknown', _matched_queries: ['fallback.unknown'] }
      ]
    };

    var expected_data = [
      { name: 'macrocounty 1', _matched_queries: ['fallback.macrocounty'] },
      { name: 'macrocounty 2', _matched_queries: ['fallback.macrocounty'] },
    ];

    function testIt() {
      trimByGranularity(req, res, function() {
        t.deepEquals(res.data, expected_data, 'only macrocounty records should be here');
        t.end();
      });
    }

    testIt();
  });

  test('all records with fallback.* matched_queries name should retain only regions when they are most granular', function(t) {
    var req = { clean: {} };

    var res = {
      data: [
        { name: 'region 1', _matched_queries: ['fallback.region'] },
        { name: 'region 2', _matched_queries: ['fallback.region'] },
        { name: 'macroregion 1', _matched_queries: ['fallback.macroregion'] },
        { name: 'dependency 1', _matched_queries: ['fallback.dependency'] },
        { name: 'country 1', _matched_queries: ['fallback.country'] },
        { name: 'unknown', _matched_queries: ['fallback.unknown'] }
      ]
    };

    var expected_data = [
      { name: 'region 1', _matched_queries: ['fallback.region'] },
      { name: 'region 2', _matched_queries: ['fallback.region'] },
    ];

    function testIt() {
      trimByGranularity(req, res, function() {
        t.deepEquals(res.data, expected_data, 'only region records should be here');
        t.end();
      });
    }

    testIt();
  });

  test('all records with fallback.* matched_queries name should retain only macroregions when they are most granular', function(t) {
    var req = { clean: {} };

    var res = {
      data: [
        { name: 'macroregion 1', _matched_queries: ['fallback.macroregion'] },
        { name: 'macroregion 2', _matched_queries: ['fallback.macroregion'] },
        { name: 'dependency 1', _matched_queries: ['fallback.dependency'] },
        { name: 'country 1', _matched_queries: ['fallback.country'] },
        { name: 'unknown', _matched_queries: ['fallback.unknown'] }
      ]
    };

    var expected_data = [
      { name: 'macroregion 1', _matched_queries: ['fallback.macroregion'] },
      { name: 'macroregion 2', _matched_queries: ['fallback.macroregion'] },
    ];

    function testIt() {
      trimByGranularity(req, res, function() {
        t.deepEquals(res.data, expected_data, 'only macroregion records should be here');
        t.end();
      });
    }

    testIt();
  });

  test('all records with fallback.* matched_queries name should retain countries over dependencies', function(t) {
    var req = { clean: {} };

    var res = {
      data: [
        { name: 'dependency 1', _matched_queries: ['fallback.dependency'] },
        { name: 'country 1', _matched_queries: ['fallback.country'] },
        { name: 'country 2', _matched_queries: ['fallback.country'] },
        { name: 'unknown', _matched_queries: ['fallback.unknown'] }
      ]
    };

    var expected_data = [
      { name: 'country 1', _matched_queries: ['fallback.country'] },
      { name: 'country 2', _matched_queries: ['fallback.country'] },
    ];

    function testIt() {
      trimByGranularity(req, res, function() {
        t.deepEquals(res.data, expected_data, 'only country records should be here');
        t.end();
      });
    }

    testIt();
  });

  test('all records with fallback.* matched_queries name should retain only dependencies when they are most granular', function(t) {
    var req = { clean: {} };

    var res = {
      data: [
        { name: 'dependency 1', _matched_queries: ['fallback.dependency'] },
        { name: 'dependency 2', _matched_queries: ['fallback.dependency'] },
        { name: 'unknown', _matched_queries: ['fallback.unknown'] }
      ]
    };

    var expected_data = [
      { name: 'dependency 1', _matched_queries: ['fallback.dependency'] },
      { name: 'dependency 2', _matched_queries: ['fallback.dependency'] },
    ];

    function testIt() {
      trimByGranularity(req, res, function() {
        t.deepEquals(res.data, expected_data, 'only dependency records should be here');
        t.end();
      });
    }

    testIt();
  });

  test('presence of any non-fallback.* named queries should not trim', function(t) {
    var req = { clean: {} };

    var res = {
      data: [
        { name: 'region', _matched_queries: ['fallback.region'] },
        { name: 'country', _matched_queries: ['fallback.country'] },
        { name: 'result with non-named query' }
      ]
    };

    var expected_data = [
      { name: 'region', _matched_queries: ['fallback.region'] },
      { name: 'country', _matched_queries: ['fallback.country'] },
      { name: 'result with non-named query' }
    ];

    function testIt() {
      trimByGranularity(req, res, function() {
        t.deepEquals(res.data, expected_data, 'all should results should have been retained');
        t.end();
      });
    }

    testIt();

  });

};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('[middleware] trimByGranularity: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
