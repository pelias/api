var trimByGranularity = require('../../../middleware/trimByGranularity')();

module.exports.tests = {};

module.exports.tests.trimByGranularity = function(test, common) {
  test('empty res and req should not throw exception', function(t) {
    function testIt() {
      trimByGranularity({}, {}, function() {});
    }

    t.doesNotThrow(testIt, 'an exception should not have been thrown');
    t.end();
  });

  test('when venue records are most granular, only they should be retained', function(t) {
    var req = { clean: {} };

    var res = {
      data: [
        { name: 'venue 1', layer: 'venue' },
        { name: 'venue 2', layer: 'venue' },
        { name: 'address 1', layer: 'address' },
        { name: 'neighbourhood 1', layer: 'neighbourhood' },
        { name: 'locality 1', layer: 'locality' },
        { name: 'localadmin 1', layer: 'localadmin' },
        { name: 'county 1', layer: 'county' },
        { name: 'macrocounty 1', layer: 'macrocounty' },
        { name: 'region 1', layer: 'region' },
        { name: 'macroregion 1', layer: 'macroregion' },
        { name: 'country 1', layer: 'country' }
      ]
    };

    var expected_data = [
      { name: 'venue 1', layer: 'venue' },
      { name: 'venue 2', layer: 'venue' },
    ];

    function testIt() {
      trimByGranularity(req, res, function() {
        t.deepEquals(res.data, expected_data, 'only venue records should be here');
        t.end();
      });
    }

    testIt();

  });

  test('when address records are most granular, only they should be retained', function(t) {
    var req = { clean: {} };

    var res = {
      data: [
        { name: 'address 1', layer: 'address' },
        { name: 'address 2', layer: 'address' },
        { name: 'neighbourhood 1', layer: 'neighbourhood' },
        { name: 'locality 1', layer: 'locality' },
        { name: 'localadmin 1', layer: 'localadmin' },
        { name: 'county 1', layer: 'county' },
        { name: 'macrocounty 1', layer: 'macrocounty' },
        { name: 'region 1', layer: 'region' },
        { name: 'macroregion 1', layer: 'macroregion' },
        { name: 'country 1', layer: 'country' },
      ]
    };

    var expected_data = [
      { name: 'address 1', layer: 'address' },
      { name: 'address 2', layer: 'address' }
    ];

    function testIt() {
      trimByGranularity(req, res, function() {
        t.deepEquals(res.data, expected_data, 'only address records should be here');
        t.end();
      });
    }

    testIt();

  });

  test('when neighbourhood records are most granular, only they should be retained', function(t) {
    var req = { clean: {} };

    var res = {
      data: [
        { name: 'neighbourhood 1', layer: 'neighbourhood' },
        { name: 'neighbourhood 2', layer: 'neighbourhood' },
        { name: 'locality 1', layer: 'locality' },
        { name: 'locality 2', layer: 'locality' },
        { name: 'localadmin 1', layer: 'localadmin' },
        { name: 'localadmin 2', layer: 'localadmin' },
        { name: 'county 1', layer: 'county' },
        { name: 'macrocounty 1', layer: 'macrocounty' },
        { name: 'region 1', layer: 'region' },
        { name: 'macroregion 1', layer: 'macroregion' },
        { name: 'country 1', layer: 'country' }
      ]
    };

    var expected_data = [
      { name: 'neighbourhood 1', layer: 'neighbourhood' },
      { name: 'neighbourhood 2', layer: 'neighbourhood' }
    ];

    function testIt() {
      trimByGranularity(req, res, function() {
        t.deepEquals(res.data, expected_data, 'only neighbourhood records should be here');
        t.end();
      });
    }

    testIt();

  });

  test('when locality/localadmin records are most granular, only they should be retained', function(t) {
    var req = { clean: {} };

    var res = {
      data: [
        { name: 'locality 1', layer: 'locality' },
        { name: 'locality 2', layer: 'locality' },
        { name: 'localadmin 1', layer: 'localadmin' },
        { name: 'localadmin 2', layer: 'localadmin' },
        { name: 'county 1', layer: 'county' },
        { name: 'macrocounty 1', layer: 'macrocounty' },
        { name: 'region 1', layer: 'region' },
        { name: 'macroregion 1', layer: 'macroregion' },
        { name: 'country 1', layer: 'country' },
      ]
    };

    var expected_data = [
      { name: 'locality 1', layer: 'locality' },
      { name: 'locality 2', layer: 'locality' },
      { name: 'localadmin 1', layer: 'localadmin' },
      { name: 'localadmin 2', layer: 'localadmin' }
    ];

    function testIt() {
      trimByGranularity(req, res, function() {
        t.deepEquals(res.data, expected_data, 'only locality/localadmin records should be here');
        t.end();
      });
    }

    testIt();

  });

  test('when county/macrocounty records are most granular, only they should be retained', function(t) {
    var req = { clean: {} };

    var res = {
      data: [
        { name: 'county 1', layer: 'county' },
        { name: 'county 2', layer: 'county' },
        { name: 'macrocounty 1', layer: 'macrocounty' },
        { name: 'macrocounty 2', layer: 'macrocounty' },
        { name: 'region 1', layer: 'region' },
        { name: 'macroregion 1', layer: 'macroregion' },
        { name: 'country 1', layer: 'country' },
      ]
    };

    var expected_data = [
      { name: 'county 1', layer: 'county' },
      { name: 'county 2', layer: 'county' },
      { name: 'macrocounty 1', layer: 'macrocounty' },
      { name: 'macrocounty 2', layer: 'macrocounty' },
    ];

    function testIt() {
      trimByGranularity(req, res, function() {
        t.deepEquals(res.data, expected_data, 'only county/macrocounty records should be here');
        t.end();
      });
    }

    testIt();

  });

  test('when region/macroregion records are most granular, only they should be retained', function(t) {
    var req = { clean: {} };

    var res = {
      data: [
        { name: 'region 1', layer: 'region' },
        { name: 'region 2', layer: 'region' },
        { name: 'macroregion 1', layer: 'macroregion' },
        { name: 'macroregion 2', layer: 'macroregion' },
        { name: 'country 1', layer: 'country' },
      ]
    };

    var expected_data = [
      { name: 'region 1', layer: 'region' },
      { name: 'region 2', layer: 'region' },
      { name: 'macroregion 1', layer: 'macroregion' },
      { name: 'macroregion 2', layer: 'macroregion' }
    ];

    function testIt() {
      trimByGranularity(req, res, function() {
        t.deepEquals(res.data, expected_data, 'only region/macroregion records should be here');
        t.end();
      });
    }

    testIt();

  });

  test('when country records are most granular, only they should be retained', function(t) {
    var req = { clean: {} };

    var res = {
      data: [
        { name: 'country 1', layer: 'country' },
        { name: 'country 2', layer: 'country' }
      ]
    };

    var expected_data = [
      { name: 'country 1', layer: 'country' },
      { name: 'country 2', layer: 'country' }
    ];

    function testIt() {
      trimByGranularity(req, res, function() {
        t.deepEquals(res.data, expected_data, 'only country records should be here');
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
