var sanitize = require('../../../sanitiser/_geo_common');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof sanitize.sanitize_bbox, 'function', 'sanitize_bbox is a valid function');
    t.equal(typeof sanitize.sanitize_coord, 'function', 'sanitize_coord is a valid function');
    t.equal(typeof sanitize.sanitize_boundary_circle, 'function', 'sanitize_boundary_circle is a valid function');
    t.end();
  });
};

module.exports.tests.sanitize = function(test, common) {
  test('valid circle trio', function (t) {
    var clean = {};
    var params = {
      'boundary.circle.lat': 11,
      'boundary.circle.lon': 22,
      'boundary.circle.radius': 33
    };
    var is_required = true;
    var all_required = true;

    sanitize.sanitize_boundary_circle(clean, params, is_required, all_required);
    t.equal(clean['boundary.circle.lat'], params['boundary.circle.lat'], 'lat approved');
    t.equal(clean['boundary.circle.lon'], params['boundary.circle.lon'], 'lon approved');
    t.equal(clean['boundary.circle.radius'], params['boundary.circle.radius'], 'radius approved');
    t.end();
  });

  test('valid circle, radius only, all not required', function (t) {
    var clean = {};
    var params = {
      'boundary.circle.radius': 33
    };
    var is_required = true;
    var all_required = false;

    sanitize.sanitize_boundary_circle(clean, params, is_required, all_required);
    t.equal(clean['boundary.circle.radius'], params['boundary.circle.radius'], 'radius approved');
    t.end();
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('SANITIZER _geo_common ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
