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
      lat: 29.49136, lon: -82.50622
    });

    var compiled = JSON.parse( JSON.stringify( query ) );
    var expected = require('../fixture/reverse_standard');

    t.deepEqual(compiled, expected, 'valid reverse query');
    t.end();
  });

  test('valid query with radius', function(t) {
    var query = generate({
      lat: 29.49136, lon: -82.50622, boundary_circle_radius: 123
    });

    var compiled = JSON.parse( JSON.stringify( query )).query.filtered.filter.bool.must[0].geo_distance.distance;
    var expected = '123km';

    t.deepEqual(compiled, expected, 'distance set to boundary circle radius');
    t.end();
  });

  test('valid query with boundary.circle lat/lon/radius', function(t) {
    var clean = {
      lat: 29.49136,
      lon: -82.50622,
      boundary_circle_lat: 111,
      boundary_circle_long: 333
    };
    var query = generate(clean);

    var compiled = JSON.parse( JSON.stringify( query )).query.filtered.filter.bool.must[0].geo_distance.center_point;
    var expected = { lat: clean.lat, lon: clean.lon };

    t.deepEqual(compiled, expected, 'point.lat/lon overrides boundary.circle.lat/lon');
    t.end();
  });

  test('size fuzz test', function(t) {
    // test different sizes
    var sizes = [1,2,10,undefined,null];
    sizes.forEach( function( size ){
      var query = generate({
        lat: 29.49136, lon: -82.50622, size: size
      });

      var compiled = JSON.parse( JSON.stringify( query ) );
      t.equal( compiled.size, size ? size : 1, 'valid reverse query for size: '+ size);
    });
    t.end();
  });

  test('valid boundary.country reverse search', function(t) {
    var query = generate({
      lat: 29.49136, lon: -82.50622,
      boundary: { country: 'ABC' }
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
