
var search  = require('../../../sanitiser/search'),
    _input  = require('../sanitiser/_input'),
    parser = require('../../../helper/query_parser'),
    defaultParsed = _input.defaultParsed,
    _sanitize = search.sanitize,
    middleware = search.middleware,
    delim = ',',
    defaultError = 'invalid param \'input\': text length, must be >0',
    defaultClean =  { input: 'test', 
                      types: {
                      },
                      size: 10,
                      details: true,
                      parsed_input: defaultParsed,
                    },
    sanitize = function(query, cb) { _sanitize({'query':query}, cb); };

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('sanitize interface', function(t) {
    t.equal(typeof sanitize, 'function', 'sanitize is a function');
    t.equal(sanitize.length, 2, 'sanitize interface');
    t.end();
  });
  test('middleware interface', function(t) {
    t.equal(typeof middleware, 'function', 'middleware is a function');
    t.equal(middleware.length, 3, 'sanitizee has a valid middleware');
    t.end();
  });
};

module.exports.tests.sanitize_invalid_input = function(test, common) {
  test('invalid input', function(t) {  
    var invalid = [ '', 100, null, undefined, new Date() ];
    invalid.forEach( function( input ){
      sanitize({ input: input }, function( err, clean ){
        t.equal(err, 'invalid param \'input\': text length, must be >0', input + ' is an invalid input');
        t.equal(clean, undefined, 'clean not set');
      });
    });
    t.end();
  });
};

module.exports.tests.sanitise_valid_input = function(test, common) {
  test('valid short input', function(t) {
    sanitize({ input: 'a' }, function( err, clean ){
      t.equal(err, undefined, 'no error');
    });
    t.end();
  });

  test('valid not-quite-as-short input', function(t) {
    sanitize({ input: 'aa' }, function( err, clean ){
      t.equal(err, undefined, 'no error');
    });
    t.end();
  });

  test('valid longer input', function(t) {
    sanitize({ input: 'aaaaaaaa' }, function( err, clean ){
      t.equal(err, undefined, 'no error');
    });
    t.end();
  });
};

module.exports.tests.sanitize_input_with_delim = function(test, common) {
  var inputs = [ 'a,bcd', '123 main st, admin1', ',,,', ' ' ];

  test('valid inputs with a comma', function(t) {  
    inputs.forEach( function( input ){
      sanitize({ input: input }, function( err, clean ){
        var expected = JSON.parse(JSON.stringify( defaultClean ));
        expected.input = input;

        expected.parsed_input = parser.get_parsed_address(input);
        t.equal(err, undefined, 'no error');
        t.equal(clean.parsed_input.name, expected.parsed_input.name, 'clean name set correctly');

      });
    });
    t.end();
  });
};

module.exports.tests.sanitize_lat = function(test, common) {
  var lats = {
    invalid: [],
    valid: [ 0, 45, 90, -0, '0', '45', '90', -181, -120, -91, 91, 120, 181  ]
  };
  test('invalid lat', function(t) {  
    lats.invalid.forEach( function( lat ){
      sanitize({ input: 'test', lat: lat, lon: 0 }, function( err, clean ){
        t.equal(err, 'invalid param \'lat\': must be >-90 and <90', lat + ' is an invalid latitude');
        t.equal(clean, undefined, 'clean not set');
      });
    });
    t.end();
  });
  test('valid lat', function(t) {  
    lats.valid.forEach( function( lat ){
      sanitize({ input: 'test', lat: lat, lon: 0 }, function( err, clean ){
        var expected = JSON.parse(JSON.stringify( defaultClean ));
        expected.lat = parseFloat( lat );
        t.equal(err, undefined, 'no error');
        t.deepEqual(clean.lat, expected.lat, 'clean lat set correctly (' + lat + ')');
      });
    });
    t.end();
  });
};

module.exports.tests.sanitize_lon = function(test, common) {
  var lons = {
    valid: [ -381, -181, -180, -1, -0, 0, 45, 90, '-180', '0', '180', 181 ]
  };
  test('valid lon', function(t) {  
    lons.valid.forEach( function( lon ){
      sanitize({ input: 'test', lat: 0, lon: lon }, function( err, clean ){
        var expected = JSON.parse(JSON.stringify( defaultClean ));
        expected.lon = parseFloat( lon );
        t.equal(err, undefined, 'no error');
        t.deepEqual(clean.lon, expected.lon, 'clean set correctly (' + lon + ')');
      });
    });
    t.end();
  });
};

module.exports.tests.sanitize_optional_geo = function(test, common) {
  test('no lat/lon', function(t) {
    sanitize({ input: 'test' }, function( err, clean ){
      t.equal(err, undefined, 'no error');
      t.equal(clean.lat, undefined, 'clean set without lat');
      t.equal(clean.lon, undefined, 'clean set without lon');
    });
    t.end();
  });
  test('no lat', function(t) {
    sanitize({ input: 'test', lon: 0 }, function( err, clean ){
      var expected_lon = 0;
      t.equal(err, undefined, 'no error');
      t.deepEqual(clean.lon, expected_lon, 'clean set correctly (without any lat)');
    });
    t.end();
  });
  test('no lon', function(t) {
    sanitize({ input: 'test', lat: 0 }, function( err, clean ){
      var expected_lat = 0;
      t.equal(err, undefined, 'no error');
      t.deepEqual(clean.lat, expected_lat, 'clean set correctly (without any lon)');
    });
    t.end();
  });
};

module.exports.tests.sanitize_bbox = function(test, common) {
  var bboxes = {
    invalid: [
      '91;-181,-91,181', // invalid - semicolon between coordinates
      'these,are,not,numbers',
      '0,0,0,notANumber',
      ',,,',
      '91, -181, -91',   // invalid - missing a coordinate
      '123,12',          // invalid - missing coordinates
      ''                 // invalid - empty param
    ],
    valid: [
      '-179,90,34,-80', // valid top_right lon/lat, bottom_left lon/lat
      '0,0,0,0',
      '10,20,30,40',
      '-40,-20,10,30',
      '-40,-20,10,30',
      '-1200,20,1000,20',
      '-1400,90,1400,-90',
      // wrapped latitude coordinates
      '-181,90,34,-180',
      '-170,91,-181,45',
      '-181,91,181,-91',
      '91, -181,-91,11',
      '91, -11,-91,181'
    ]
    
  };
  test('invalid bbox', function(t) {  
    bboxes.invalid.forEach( function( bbox ){
      sanitize({ input: 'test', bbox: bbox }, function( err, clean ){
        t.equal(err, undefined, 'no error');
        t.equal(clean.bbox, undefined, 'falling back on 50km distance from centroid');
      });
    });
    t.end();
  });
  test('valid bbox', function(t) {  
    bboxes.valid.forEach( function( bbox ){
      sanitize({ input: 'test', bbox: bbox }, function( err, clean ){
        var bboxArray = bbox.split(',').map(function(i) {
          return parseInt(i);
        });
        var expected_bbox = {
          right: Math.max(bboxArray[0], bboxArray[2]),
          top: Math.max(bboxArray[1], bboxArray[3]),
          left: Math.min(bboxArray[0], bboxArray[2]),
          bottom: Math.min(bboxArray[1], bboxArray[3])
        };
        t.equal(err, undefined, 'no error');
        t.deepEqual(clean.bbox, expected_bbox, 'clean set correctly (' + bbox + ')');
      });
    });
    t.end();
  });
};

module.exports.tests.sanitize_zoom = function(test, common) {
  test('invalid zoom value', function(t) {
    sanitize({ zoom: 'a', input: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.equal(clean.zoom, undefined, 'zoom not set');
      t.end();
    });
  });
  test('below min zoom value', function(t) {
    sanitize({ zoom: -100, input: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.equal(clean.zoom, 1, 'min zoom set');
      t.end();
    });
  });
  test('above max zoom value', function(t) {
    sanitize({ zoom: 9999, input: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.equal(clean.zoom, 18, 'max zoom set');
      t.end();
    });
  });
};

module.exports.tests.sanitize_size = function(test, common) {
  test('invalid size value', function(t) {
    sanitize({ size: 'a', input: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.equal(clean.size, 10, 'default size set');
      t.end();
    });
  });
  test('below min size value', function(t) {
    sanitize({ size: -100, input: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.equal(clean.size, 1, 'min size set');
      t.end();
    });
  });
  test('above max size value', function(t) {
    sanitize({ size: 9999, input: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.equal(clean.size, 40, 'max size set');
      t.end();
    });
  });
};

module.exports.tests.sanitize_details = function(test, common) {
  var invalid_values = [null, -1, 123, NaN, 'abc'];
  invalid_values.forEach(function(details) {
    test('invalid details param ' + details, function(t) {
      sanitize({ input: 'test', lat: 0, lon: 0, details: details }, function( err, clean ){
        t.equal(clean.details, false, 'default details set (to false)');
        t.end();
      });
    });  
  });

  var valid_values = ['true', true, 1, '1', 'yes', 'y'];
  valid_values.forEach(function(details) {
    test('valid details param ' + details, function(t) {
      sanitize({ input: 'test', lat: 0, lon: 0, details: details }, function( err, clean ){
        t.equal(clean.details, true, 'details set to true');
        t.end();
      });
    });  
  });

  var valid_false_values = ['false', false, 0, '0', 'no', 'n'];
  valid_false_values.forEach(function(details) {
    test('test setting false explicitly ' + details, function(t) {
      sanitize({ input: 'test', lat: 0, lon: 0, details: details }, function( err, clean ){
        t.equal(clean.details, false, 'details set to false');
        t.end();
      });
    }); 
  });

  test('test default behavior', function(t) {
    sanitize({ input: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.equal(clean.details, true, 'details set to true');
      t.end();
    });
  });
};

module.exports.tests.sanitize_layers = function(test, common) {
  test('unspecified', function(t) {
    sanitize({ layers: undefined, input: 'test' }, function( err, clean ){
      t.deepEqual(clean.types.from_layers, defaultClean.types.from_layers, 'default layers set');
      t.end();
    });
  });
  test('invalid layer', function(t) {
    sanitize({ layers: 'test_layer', input: 'test' }, function( err, clean ){
      var msg = 'invalid param \'layers\': must be one or more of ';
      t.true(err.match(msg), 'invalid layer requested');
      t.true(err.length > msg.length, 'invalid error message');
      t.end();
    });
  });
  test('poi (alias) layer', function(t) {
    var poi_layers = ['geoname','osmnode','osmway'];
    sanitize({ layers: 'poi', input: 'test' }, function( err, clean ){
      t.deepEqual(clean.types.from_layers, poi_layers, 'poi layers set');
      t.end();
    });
  });
  test('admin (alias) layer', function(t) {
    var admin_layers = ['admin0','admin1','admin2','neighborhood','locality','local_admin'];
    sanitize({ layers: 'admin', input: 'test' }, function( err, clean ){
      t.deepEqual(clean.types.from_layers, admin_layers, 'admin layers set');
      t.end();
    });
  });
  test('address (alias) layer', function(t) {
    var address_layers = ['osmaddress','openaddresses'];
    sanitize({ layers: 'address', input: 'test' }, function( err, clean ){
      t.deepEqual(clean.types.from_layers, address_layers, 'types from layers set');
      t.deepEqual(clean.types.from_address_parser, _input.allLayers, 'address parser uses default layers');
      t.end();
    });
  });
  test('poi alias layer plus regular layers', function(t) {
    var poi_layers = ['geoname','osmnode','osmway'];
    var reg_layers = ['admin0', 'admin1'];
    sanitize({ layers: 'poi,admin0,admin1', input: 'test' }, function( err, clean ){
      t.deepEqual(clean.types.from_layers, reg_layers.concat(poi_layers), 'poi + regular layers');
      t.end();
    });
  });
  test('admin alias layer plus regular layers', function(t) {
    var admin_layers = ['admin0','admin1','admin2','neighborhood','locality','local_admin'];
    var reg_layers   = ['geoname', 'osmway'];
    sanitize({ layers: 'admin,geoname,osmway', input: 'test' }, function( err, clean ){
      t.deepEqual(clean.types.from_layers, reg_layers.concat(admin_layers), 'admin + regular layers set');
      t.end();
    });
  });
  test('address alias layer plus regular layers', function(t) {
    var address_layers = ['osmaddress','openaddresses'];
    var reg_layers   = ['geoname', 'osmway'];
    sanitize({ layers: 'address,geoname,osmway', input: 'test' }, function( err, clean ){
      t.deepEqual(clean.types.from_layers, reg_layers.concat(address_layers), 'address + regular layers set');
      t.end();
    });
  });
  test('alias layer plus regular layers (no duplicates)', function(t) {
    var poi_layers = ['geoname','osmnode','osmway'];
    sanitize({ layers: 'poi,geoname,osmnode', input: 'test' }, function( err, clean ){
      t.deepEqual(clean.types.from_layers, poi_layers, 'poi layers found (no duplicates)');
      t.end();
    });
  });
  test('multiple alias layers (no duplicates)', function(t) {
    var alias_layers = ['geoname','osmnode','osmway','admin0','admin1','admin2','neighborhood','locality','local_admin'];
    sanitize({ layers: 'poi,admin', input: 'test' }, function( err, clean ){
      t.deepEqual(clean.types.from_layers, alias_layers, 'all layers found (no duplicates)');
      t.end();
    });
  });
};

module.exports.tests.invalid_params = function(test, common) {
  test('invalid input params', function(t) {
    sanitize( undefined, function( err, clean ){
      t.equal(err, defaultError, 'handle invalid params gracefully');
      t.end();
    });
  });
};

module.exports.tests.middleware_failure = function(test, common) {
  test('middleware failure', function(t) {
    var res = { status: function( code ){
      t.equal(code, 400, 'status set');
    }};
    var next = function( message ){
      t.equal(message, defaultError);
      t.end();
    };
    middleware( {}, res, next );
  });
};

module.exports.tests.middleware_success = function(test, common) {
  test('middleware success', function(t) {
    var req = { query: { input: 'test' }};
    var next = function( message ){
      t.equal(message, undefined, 'no error message set');
      t.end();
    };
    middleware( req, undefined, next );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('SANTIZE /search ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
