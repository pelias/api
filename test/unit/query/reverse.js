var generate = require('../../../query/reverse');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof generate, 'function', 'valid function');
    t.end();
  });
};

module.exports.tests.query = function(test, common) {
  test('valid query', function(t) {
    var query = generate({
      'point.lat': 29.49136,
      'point.lon': -82.50622,
      'boundary.circle.lat': 29.49136,
      'boundary.circle.lon': -82.50622,
      'boundary.circle.radius': 3
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/reverse_standard');

    t.deepEqual(compiled.type, 'reverse', 'query type set');
    t.deepEqual(compiled.body, expected, 'reverse_standard');
    t.end();
  });

  test('valid query - null island', function(t) {
    var query = generate({
      'point.lat': 0,
      'point.lon': 0,
      'boundary.circle.lat': 0,
      'boundary.circle.lon': 0,
      'boundary.circle.radius': 3
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/reverse_null_island');

    t.deepEqual(compiled.type, 'reverse', 'query type set');
    t.deepEqual(compiled.body, expected, 'reverse_null_island');
    t.end();
  });

  test('valid query with radius', function(t) {
    var query = generate({
      'point.lat': 29.49136,
      'point.lon': -82.50622,
      'boundary.circle.lat': 29.49136,
      'boundary.circle.lon': -82.50622,
      'boundary.circle.radius': 123
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = '123km';

    t.deepEqual(compiled.type, 'reverse', 'query type set');
    t.deepEqual(compiled.body.query.bool.filter[0].geo_distance.distance, expected, 'distance set to boundary circle radius');
    t.end();
  });

  // for coarse reverse cases where boundary circle radius isn't used
  test('undefined radius set to default radius', function(t) {
    var query = generate({
      'point.lat': 12.12121,
      'point.lon': 21.21212,
      'boundary.circle.lat': 12.12121,
      'boundary.circle.lon': 21.21212
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = '1km';

    t.deepEqual(compiled.type, 'reverse', 'query type set');
    t.deepEqual(compiled.body.query.bool.filter[0].geo_distance.distance, expected, 'distance set to default boundary circle radius');
    t.end();
  });

  test('boundary.circle lat/lon/radius - overrides point.lat/lon when set', function(t) {
    var clean = {
      'point.lat': 29.49136,
      'point.lon': -82.50622,
      'boundary.circle.lat': 111,
      'boundary.circle.lon': 333,
      'boundary.circle.radius': 3
    };
    var query = generate(clean);
    var compiled = JSON.parse( JSON.stringify( query ) );

    // this should not equal `point.lat` and `point.lon` as it was explitely specified
    var expected = { lat: clean['boundary.circle.lat'], lon: clean['boundary.circle.lon'] };
    var centroid = compiled.body.query.bool.filter[0].geo_distance.center_point;

    t.deepEqual(compiled.type, 'reverse', 'query type set');
    t.deepEqual(centroid, expected, 'reverse: boundary.circle/lon overrides point.lat/lon');
    t.end();
  });

  test('size fuzz test', function(t) {
    // test different sizes
    var sizes = [1,4,20,undefined,null];
    var expected = [1,4,20,1,1];
    sizes.forEach( function( size, index ){
      var query = generate({
        'point.lat': 29.49136, 'point.lon': -82.50622, querySize: size
      });

      var compiled = JSON.parse( JSON.stringify( query ) );
      t.equal( compiled.body.size, expected[index], 'valid reverse query for size: '+ size);
    });
    t.end();
  });

  test('valid boundary.country reverse search', function(t) {
    var query = generate({
      'point.lat': 29.49136,
      'point.lon': -82.50622,
      'boundary.circle.lat': 29.49136,
      'boundary.circle.lon': -82.50622,
      'boundary.circle.radius': 3,
      'boundary.country': 'ABC'
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/reverse_with_boundary_country');

    t.deepEqual(compiled.type, 'reverse', 'query type set');
    t.deepEqual(compiled.body, expected, 'valid reverse query with boundary.country');
    t.end();
  });

  test('valid sources filter', function(t) {
    var query = generate({
      'point.lat': 29.49136,
      'point.lon': -82.50622,
      'boundary.circle.lat': 29.49136,
      'boundary.circle.lon': -82.50622,
      'boundary.circle.radius': 3,
      'sources': ['test']
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/reverse_with_source_filtering');

    t.deepEqual(compiled.type, 'reverse', 'query type set');
    t.deepEqual(compiled.body, expected, 'valid reverse query with source filtering');
    t.end();
  });

  test('valid layers filter', (t) => {
    const query = generate({
      'point.lat': 29.49136,
      'point.lon': -82.50622,
      'boundary.circle.lat': 29.49136,
      'boundary.circle.lon': -82.50622,
      'boundary.circle.radius': 3,
      // only venue, address, and street layers should be retained
      'layers': ['neighbourhood', 'venue', 'locality', 'address', 'region', 'street', 'country']
    });

    const compiled = JSON.parse( JSON.stringify( query ) );
    const expected = require('../fixture/reverse_with_layer_filtering');

    t.deepEqual(compiled.type, 'reverse', 'query type set');
    t.deepEqual(compiled.body, expected, 'valid reverse query with source filtering');
    t.end();

  });

  test('valid layers filter - subset of non-coarse layers', (t) => {
    const query = generate({
      'point.lat': 29.49136,
      'point.lon': -82.50622,
      'boundary.circle.lat': 29.49136,
      'boundary.circle.lon': -82.50622,
      'boundary.circle.radius': 3,
      // only venue, address, and street layers should be retained
      'layers': ['neighbourhood', 'venue', 'street', 'locality']
    });

    const compiled = JSON.parse( JSON.stringify( query ) );
    const expected = require('../fixture/reverse_with_layer_filtering_non_coarse_subset');

    t.deepEqual(compiled.type, 'reverse', 'query type set');
    t.deepEqual(compiled.body, expected, 'valid reverse query with source filtering');
    t.end();

  });

};

module.exports.all = function (tape, common) {
  function test(name, testFunction) {
    return tape('reverse query ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
