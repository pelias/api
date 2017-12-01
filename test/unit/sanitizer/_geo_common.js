var sanitize = require('../../../sanitizer/_geo_common');

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof sanitize.sanitize_rect, 'function', 'sanitize_rect is a valid function');
    t.equal(typeof sanitize.sanitize_coord, 'function', 'sanitize_coord is a valid function');
    t.equal(typeof sanitize.sanitize_circle, 'function', 'sanitize_circle is a valid function');
    t.equal(typeof sanitize.sanitize_point, 'function', 'sanitize_point is a valid function');
    t.end();
  });
};

// @note: for better coverage see unit tests for 'wrap.js'.
module.exports.tests.wrapping = function(test, common) {
  test('control - no wrapping required', function (t) {
    var clean = {};
    var params = {
      'point.lat': +1.1,
      'point.lon': -1.1
    };
    sanitize.sanitize_point( 'point', clean, params, false );
    t.equal(clean['point.lat'], +1.1, 'not changed');
    t.equal(clean['point.lon'], -1.1, 'not changed');
    t.end();
  });
  test('positive longitude wrapping', function (t) {
    var clean = {};
    var params = {
      'point.lat': +1.1,
      'point.lon': +181.1
    };
    sanitize.sanitize_point( 'point', clean, params, false );
    t.equal(clean['point.lat'], +1.1, 'not changed');
    t.equal(clean['point.lon'], -178.9, 'equal to (-180 + 1.1)');
    t.end();
  });
  test('negative longitude wrapping', function (t) {
    var clean = {};
    var params = {
      'point.lat': -1.1,
      'point.lon': -181.1
    };
    sanitize.sanitize_point( 'point', clean, params, false );
    t.equal(clean['point.lat'], -1.1, 'not changed');
    t.equal(clean['point.lon'], +178.9, 'equal to (+180 - 1.1)');
    t.end();
  });
  test('positive latitudinal wrapping', function (t) {
    var clean = {};
    var params = {
      'point.lat': 91.1,
      'point.lon': 1.1
    };
    sanitize.sanitize_point( 'point', clean, params, false );
    t.equal(clean['point.lat'], +88.9, 'equal to (+90 - 1.1)');
    t.equal(clean['point.lon'], -178.9, 'equal to (-180 + 1.1)'); // polar flip
    t.end();
  });
  test('negative latitudinal wrapping', function (t) {
    var clean = {};
    var params = {
      'point.lat': -91.1,
      'point.lon': -1.1
    };
    sanitize.sanitize_point( 'point', clean, params, false );
    t.equal(clean['point.lat'], -88.9, 'equal to (-90 + 1.1)');
    t.equal(clean['point.lon'], +178.9, 'equal to (+180 - 1.1)'); // polar flip
    t.end();
  });
};

module.exports.tests.coord = function(test, common) {
  test('valid coord', function (t) {
    var clean = {};
    var params = {
      'foo': -40.659
    };
    var mandatory = false;

    sanitize.sanitize_coord( 'foo', clean, params, mandatory );
    t.equal(clean.foo, params.foo);
    t.end();
  });

  test('invalid coord', function (t) {
    var clean = {};
    var params = {
      'foo': 'bar'
    };
    var mandatory = false;

    sanitize.sanitize_coord( 'foo', clean, params, mandatory );
    t.equal(clean.foo, undefined, 'not set');
    t.end();
  });

  test('nothing specified', function (t) {
    var clean = {};
    var params = {};
    var mandatory = false;

    t.doesNotThrow( function(){
      sanitize.sanitize_coord( 'foo', clean, params, mandatory );
    });
    t.end();
  });

  test('nothing specified - mandatory', function (t) {
    var clean = {};
    var params = {};
    var mandatory = true;

    t.throws( function(){
      sanitize.sanitize_coord( 'foo', clean, params, mandatory );
    });
    t.end();
  });

};

module.exports.tests.point = function(test, common) {
  test('valid point duo', function (t) {
    var clean = {};
    var params = {
      'foo.bar.lat': 11,
      'foo.bar.lon': 22
    };
    var mandatory = false;

    sanitize.sanitize_point( 'foo.bar', clean, params, mandatory );
    t.equal(clean['foo.bar.lat'], params['foo.bar.lat'], 'lat approved');
    t.equal(clean['foo.bar.lon'], params['foo.bar.lon'], 'lon approved');
    t.end();
  });

  test('invalid point, lat only', function (t) {
    var clean = {};
    var params = {
      'foo.bar.lat': 11
    };
    var mandatory = false;

    t.throws( function(){
      sanitize.sanitize_point( 'foo.bar', clean, params, mandatory );
    });
    t.end();
  });

  test('invalid point, lon only', function (t) {
    var clean = {};
    var params = {
      'foo.bar.lon': 22,
    };
    var mandatory = false;

    t.throws( function(){
      sanitize.sanitize_point( 'foo.bar', clean, params, mandatory );
    });
    t.end();
  });

  test('invalid lat value specified', function (t) {
    var clean = {};
    var params = {
      'foo.bar.lat': 'foobar',
      'foo.bar.lon': 22,
    };
    var mandatory = false;

    t.throws( function(){
      sanitize.sanitize_point( 'foo.bar', clean, params, mandatory );
    });
    t.end();
  });

  test('invalid lon value specified', function (t) {
    var clean = {};
    var params = {
      'foo.bar.lat': 11,
      'foo.bar.lon': 'foobar'
    };
    var mandatory = false;

    t.throws( function(){
      sanitize.sanitize_point( 'foo.bar', clean, params, mandatory );
    });
    t.end();
  });

  test('nothing specified', function (t) {
    var clean = {};
    var params = {};
    var mandatory = false;

    t.doesNotThrow( function(){
      sanitize.sanitize_point( 'foo.bar', clean, params, mandatory );
    });
    t.end();
  });

  test('nothing specified - mandatory', function (t) {
    var clean = {};
    var params = {};
    var mandatory = true;

    t.throws( function(){
      sanitize.sanitize_point( 'foo.bar', clean, params, mandatory );
    });
    t.end();
  });
};

module.exports.tests.rect = function(test, common) {
  test('valid rect quad', function (t) {
    var clean = {};
    var params = {
      'boundary.rect.min_lat': -41.614,
      'boundary.rect.max_lat': -40.659,
      'boundary.rect.min_lon': 174.612,
      'boundary.rect.max_lon': 176.333
    };
    var mandatory = false;

    sanitize.sanitize_rect( 'boundary.rect', clean, params, mandatory );
    t.equal(clean['boundary.rect.min_lat'], params['boundary.rect.min_lat'], 'min_lat approved');
    t.equal(clean['boundary.rect.max_lat'], params['boundary.rect.max_lat'], 'min_lat approved');
    t.equal(clean['boundary.rect.min_lon'], params['boundary.rect.min_lon'], 'min_lat approved');
    t.equal(clean['boundary.rect.max_lon'], params['boundary.rect.max_lon'], 'min_lat approved');
    t.end();
  });

  test('valid rect quad, null island', function (t) {
    var clean = {};
    var params = {
      'boundary.rect.min_lat': 0,
      'boundary.rect.max_lat': 0,
      'boundary.rect.min_lon': 0,
      'boundary.rect.max_lon': 0
    };
    var mandatory = false;

    sanitize.sanitize_rect( 'boundary.rect', clean, params, mandatory );
    t.equal(clean['boundary.rect.min_lat'], params['boundary.rect.min_lat'], 'min_lat approved');
    t.equal(clean['boundary.rect.max_lat'], params['boundary.rect.max_lat'], 'min_lat approved');
    t.equal(clean['boundary.rect.min_lon'], params['boundary.rect.min_lon'], 'min_lat approved');
    t.equal(clean['boundary.rect.max_lon'], params['boundary.rect.max_lon'], 'min_lat approved');
    t.end();
  });
  test('invalid rect - partially specified', function (t) {
    var clean = {};
    var params = {
      'boundary.rect.min_lat': -40.659
    };
    var mandatory = false;

    t.throws( function(){
      sanitize.sanitize_rect( 'boundary.rect', clean, params, mandatory );
    });
    t.end();
  });

  test('nothing specified', function (t) {
    var clean = {};
    var params = {};
    var mandatory = false;

    t.doesNotThrow( function(){
      sanitize.sanitize_rect( 'boundary.rect', clean, params, mandatory );
    });
    t.end();
  });

  test('nothing specified - mandatory', function (t) {
    var clean = {};
    var params = {};
    var mandatory = true;

    t.throws( function(){
      sanitize.sanitize_rect( 'boundary.rect', clean, params, mandatory );
    });
    t.end();
  });

  test('invalid rect - max/min switched', function (t) {
    var clean = {};
    var params = {
      'boundary.rect.max_lat': 52.2387,
      'boundary.rect.max_lon': 14.1367,
      'boundary.rect.min_lat': 52.7945,
      'boundary.rect.min_lon': 12.6398
    };
    var mandatory = false;

    t.throws( function() {
      sanitize.sanitize_rect( 'boundary.rect', clean, params, mandatory );
    });
    t.end();
  });
};

module.exports.tests.circle = function(test, common) {
  test('valid circle trio', function (t) {
    var clean = {};
    var params = {
      'boundary.circle.lat': 11,
      'boundary.circle.lon': 22,
      'boundary.circle.radius': 33
    };
    var mandatory = false;

    sanitize.sanitize_circle( 'boundary.circle', clean, params, mandatory );
    t.equal(clean['boundary.circle.lat'], params['boundary.circle.lat'], 'lat approved');
    t.equal(clean['boundary.circle.lon'], params['boundary.circle.lon'], 'lon approved');
    t.equal(clean['boundary.circle.radius'], params['boundary.circle.radius'], 'radius approved');
    t.end();
  });

  test('valid circle duo', function (t) {
    var clean = {};
    var params = {
      'boundary.circle.lat': 11,
      'boundary.circle.lon': 22
    };
    var mandatory = false;

    sanitize.sanitize_circle( 'boundary.circle', clean, params, mandatory );
    t.equal(clean['boundary.circle.lat'], params['boundary.circle.lat'], 'lat approved');
    t.equal(clean['boundary.circle.lon'], params['boundary.circle.lon'], 'lon approved');
    t.end();
  });

  test('invalid circle, lat only', function (t) {
    var clean = {};
    var params = {
      'boundary.circle.lat': 11,
    };
    var mandatory = false;

    t.throws( function(){
      sanitize.sanitize_circle( 'boundary.circle', clean, params, mandatory );
    });
    t.end();
  });

  test('invalid circle, lon only', function (t) {
    var clean = {};
    var params = {
      'boundary.circle.lon': 22,
    };
    var mandatory = false;

    t.throws( function(){
      sanitize.sanitize_circle( 'boundary.circle', clean, params, mandatory );
    });
    t.end();
  });

  test('invalid circle, radius only', function (t) {
    var clean = {};
    var params = {
      'boundary.circle.radius': 33
    };
    var mandatory = false;

    t.throws( function(){
      sanitize.sanitize_circle( 'boundary.circle', clean, params, mandatory );
    });
    t.end();
  });

  test('invalid circle, lon and radius only', function (t) {
    var clean = {};
    var params = {
      'boundary.circle.lon': 22,
      'boundary.circle.radius': 33
    };
    var mandatory = false;

    t.throws( function(){
      sanitize.sanitize_circle( 'boundary.circle', clean, params, mandatory );
    });
    t.end();
  });

  test('invalid circle, lat and radius only', function (t) {
    var clean = {};
    var params = {
      'boundary.circle.lat': 11,
      'boundary.circle.radius': 33
    };
    var mandatory = false;

    t.throws( function(){
      sanitize.sanitize_circle( 'boundary.circle', clean, params, mandatory );
    });
    t.end();
  });

  test('invalid lat value specified', function (t) {
    var clean = {};
    var params = {
      'boundary.circle.lat': 'foobar',
      'boundary.circle.lon': 22,
      'boundary.circle.radius': 33
    };
    var mandatory = false;

    t.throws( function(){
      sanitize.sanitize_circle( 'boundary.circle', clean, params, mandatory );
    });
    t.end();
  });

  test('invalid lon value specified', function (t) {
    var clean = {};
    var params = {
      'boundary.circle.lat': 11,
      'boundary.circle.lon': 'foobar',
      'boundary.circle.radius': 33
    };
    var mandatory = false;

    t.throws( function(){
      sanitize.sanitize_circle( 'boundary.circle', clean, params, mandatory );
    });
    t.end();
  });

  test('invalid radius value specified', function (t) {
    var clean = {};
    var params = {
      'boundary.circle.lat': 11,
      'boundary.circle.lon': 22,
      'boundary.circle.radius': 'foobar'
    };
    var mandatory = false;

    t.throws( function(){
      sanitize.sanitize_circle( 'boundary.circle', clean, params, mandatory );
    });
    t.end();
  });

  test('nothing specified', function (t) {
    var clean = {};
    var params = {};
    var mandatory = false;

    t.doesNotThrow( function(){
      sanitize.sanitize_circle( 'boundary.circle', clean, params, mandatory );
    });
    t.end();
  });

  test('nothing specified - mandatory', function (t) {
    var clean = {};
    var params = {};
    var mandatory = true;

    t.throws( function(){
      sanitize.sanitize_circle( 'boundary.circle', clean, params, mandatory );
    });
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
