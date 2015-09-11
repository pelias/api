var sanitize = require( '../../../sanitiser/_targets' )('sources', require('../../../query/sources'));

var success_response = { error: false };

module.exports.tests = {};

module.exports.tests.no_sources = function(test, common) {
  test('sources is not set', function(t) {
    var req = {
      query: { }
    };

    var response = sanitize(req);

    t.deepEqual(req.clean.types, {}, 'clean.types should be empty object');
    t.deepEqual(response, success_response, 'no error returned');
    t.end();
  });

  test('source is empty string', function(t) {
    var req = {
      query: {
        sources: ''
      }
    };

    var expected_response = {
      error: true,
      message: 'sources parameter cannot be an empty string. ' +
               'Valid options: gn, geonames, oa, openaddresses, qs, quattroshapes, osm, openstreetmap'
    };

    var response = sanitize(req);

    t.deepEqual(req.clean.types, {}, 'clean.types should be empty object');
    t.deepEqual(response, expected_response, 'no error returned');
    t.end();
  });
};

module.exports.tests.valid_sources = function(test, common) {
  test('geonames source', function(t) {
    var req = {
      query: {
        sources: 'geonames'
      }
    };

    var response = sanitize(req);

    t.deepEqual(req.clean.types, { from_sources: ['geoname'] }, 'clean.types should contain from_source entry with geonames');
    t.deepEqual(response, success_response, 'no error returned');
    t.end();
  });

  test('openstreetmap source', function(t) {
    var req = {
      query: {
        sources: 'openstreetmap'
      }
    };
    var expected_types = {
      from_sources: ['osmaddress', 'osmnode', 'osmway']
    };

    var response = sanitize(req);

    t.deepEqual(req.clean.types, expected_types, 'clean.types should contain from_source entry with multiple entries for openstreetmap');
    t.deepEqual(response, success_response, 'no error returned');
    t.end();
  });

  test('multiple sources', function(t) {
    var req = {
      query: {
        sources: 'openstreetmap,openaddresses'
      }
    };
    var expected_types = {
      from_sources: ['osmaddress', 'osmnode', 'osmway', 'openaddresses']
    };

    var response = sanitize(req);

    t.deepEqual(req.clean.types, expected_types,
                'clean.types should contain from_source entry with multiple entries for openstreetmap and openadresses');
    t.deepEqual(response, success_response, 'no error returned');
    t.end();
  });
};

module.exports.tests.invalid_sources = function(test, common) {
  test('geonames source', function(t) {
    var req = {
      query: {
        sources: 'notasource'
      }
    };
    var expected_response = {
      error: true,
      message: 'notasource is an invalid sources parameter. ' +
               'Valid options: gn, geonames, oa, openaddresses, qs, quattroshapes, osm, openstreetmap'
    };

    var response = sanitize(req);

    t.deepEqual(response, expected_response, 'error with message returned');
    t.deepEqual(req.clean.types, { }, 'clean.types should remain empty');
    t.end();
  });
};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('SANTIZE _source ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
