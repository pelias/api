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
      'boundary.circle.radius': 500
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/reverse_standard');

    t.deepEqual(compiled, expected, 'valid reverse query');
    t.end();
  });

  test('valid query - null island', function(t) {
    var query = generate({
      'point.lat': 0,
      'point.lon': 0,
      'boundary.circle.lat': 0,
      'boundary.circle.lon': 0,
      'boundary.circle.radius': 500
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/reverse_null_island');

    t.deepEqual(compiled, expected, 'valid reverse query');
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

    t.deepEqual(compiled.query.filtered.filter.bool.must[0].geo_distance.distance, expected, 'distance set to boundary circle radius');
    t.end();
  });

  test('boundary.circle lat/lon/radius - overrides point.lat/lon when set', function(t) {
    var clean = {
      'point.lat': 29.49136,
      'point.lon': -82.50622,
      'boundary.circle.lat': 111,
      'boundary.circle.lon': 333,
      'boundary.circle.radius': 500
    };
    var query = generate(clean);
    var compiled = JSON.parse( JSON.stringify( query ) );

    // this should not equal `point.lat` and `point.lon` as it was explitely specified
    var expected = { lat: clean['boundary.circle.lat'], lon: clean['boundary.circle.lon'] };
    var centroid = compiled.query.filtered.filter.bool.must[0].geo_distance.center_point;

    t.deepEqual(centroid, expected, 'boundary.circle/lon overrides point.lat/lon');
    t.end();
  });

  test('size fuzz test', function(t) {
    // test different sizes
    var sizes = [1,2,10,undefined,null];
    var expectedSizes = [1,4,20,1,1];
    sizes.forEach( function( size, index ){
      var query = generate({
        'point.lat': 29.49136, 'point.lon': -82.50622, size: size
      });

      var compiled = JSON.parse( JSON.stringify( query ) );
      t.equal( compiled.size, expectedSizes[index], 'valid reverse query for size: '+ size);
    });
    t.end();
  });

  test('valid boundary.country reverse search', function(t) {
    var query = generate({
      'point.lat': 29.49136,
      'point.lon': -82.50622,
      'boundary.circle.lat': 29.49136,
      'boundary.circle.lon': -82.50622,
      'boundary.circle.radius': 500,
      'boundary.country': 'ABC'
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/reverse_with_boundary_country');

    t.deepEqual(compiled, expected, 'valid reverse query with boundary.country');
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
