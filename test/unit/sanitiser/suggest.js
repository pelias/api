
var suggest  = require('../../../sanitiser/suggest'),
    _sanitize = suggest.sanitize,
    middleware = suggest.middleware,
    _text  = require('../sanitiser/_text'),
    parser = require('../../../helper/query_parser'),
    defaultParsed = _text.defaultParsed,
    delim = ',',
    defaultError = 'invalid param \'text\': text length, must be >0',
    defaultClean =  { text: 'test', 
                      layers: [ 'geoname', 'osmnode', 'osmway', 'admin0', 'admin1', 'admin2', 'neighborhood', 
                                'locality', 'local_admin', 'osmaddress', 'openaddresses' ], 
                      size: 10,
                      details: true,
                      lat:0,
                      lon:0,
                      parsed_text: defaultParsed,
                      default_layers_set: true
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

module.exports.tests.sanitize_text = function(test, common) {
  var texts = {
    invalid: [ '', 100, null, undefined, new Date() ],
    valid: [ 'a', 'aa', 'aaaaaaaa' ]
  };
  test('invalid text', function(t) {  
    texts.invalid.forEach( function( text ){
      sanitize({ text: text, lat: 0, lon: 0 }, function( err, clean ){
        t.equal(err, 'invalid param \'text\': text length, must be >0', text + ' is an invalid text');
        t.equal(clean, undefined, 'clean not set');
      });
    });
    t.end();
  });
  test('valid text', function(t) {  
    texts.valid.forEach( function( text ){
      sanitize({ text: text, lat: 0, lon: 0 }, function( err, clean ){
        var expected = JSON.parse(JSON.stringify( defaultClean ));
        expected.text = text;
        t.equal(err, undefined, 'no error');
        expected.parsed_text = parser(text);
        t.deepEqual(clean, expected, 'clean set correctly (' + text + ')');
      });
    });
    t.end();
  });
};

module.exports.tests.sanitize_text_with_delim = function(test, common) {
  var texts = [ 'a,bcd', '123 main st, admin1', ',,,', ' ' ];

  test('valid texts with a comma', function(t) {  
    texts.forEach( function( text ){
      sanitize({ text: text, lat: 0, lon: 0 }, function( err, clean ){
        var expected = JSON.parse(JSON.stringify( defaultClean ));
        expected.text = text;
        expected.parsed_text = parser(text);
        
        t.equal(err, undefined, 'no error');
        t.deepEqual(clean, expected, 'clean set correctly (' + text + ')');
      });
    });
    t.end();
  });
};

module.exports.tests.sanitize_lat = function(test, common) {
  var lats = {
    invalid: [ -181, -120, -91, 91, 120, 181 ],
    valid: [ 0, 45, 90, -0, '0', '45', '90' ]
  };
  test('invalid lat', function(t) {  
    lats.invalid.forEach( function( lat ){
      sanitize({ text: 'test', lat: lat, lon: 0 }, function( err, clean ){
        t.equal(err, 'invalid param \'lat\': must be >-90 and <90', lat + ' is an invalid latitude');
        t.equal(clean, undefined, 'clean not set');
      });
    });
    t.end();
  });
  test('valid lat', function(t) {  
    lats.valid.forEach( function( lat ){
      sanitize({ text: 'test', lat: lat, lon: 0 }, function( err, clean ){
        var expected = JSON.parse(JSON.stringify( defaultClean ));
        expected.lat = parseFloat( lat );
        t.equal(err, undefined, 'no error');
        expected.parsed_text = parser('test');
        t.deepEqual(clean, expected, 'clean set correctly (' + lat + ')');
      });
    });
    t.end();
  });
};

module.exports.tests.sanitize_lon = function(test, common) {
  var lons = {
    invalid: [ -360, -181, 181, 360 ],
    valid: [ -180, -1, -0, 0, 45, 90, '-180', '0', '180' ]
  };
  test('invalid lon', function(t) {  
    lons.invalid.forEach( function( lon ){
      sanitize({ text: 'test', lat: 0, lon: lon }, function( err, clean ){
        t.equal(err, 'invalid param \'lon\': must be >-180 and <180', lon + ' is an invalid longitude');
        t.equal(clean, undefined, 'clean not set');
        
      });
    });
    t.end();
  });
  test('valid lon', function(t) {  
    lons.valid.forEach( function( lon ){
      sanitize({ text: 'test', lat: 0, lon: lon }, function( err, clean ){
        var expected = JSON.parse(JSON.stringify( defaultClean ));
        expected.lon = parseFloat( lon );
        t.equal(err, undefined, 'no error');
        expected.parsed_text = parser('test');
        t.deepEqual(clean, expected, 'clean set correctly (' + lon + ')');
      });
    });
    t.end();
  });
};

module.exports.tests.sanitize_bbox = function(test, common) {
  var bboxes = {
    invalid_coordinates: [
      '-181,90,34,-180', // invalid top_right lon, bottom_left lat
      '-170,91,-181,45', // invalid top_right lat, bottom_left lon
      '-181,91,181,-91', // invalid top_right lon/lat, bottom_left lon/lat
      '91, -181,-91,181',// invalid - spaces between coordinates
    ],
    invalid: [
      '91;-181,-91,181', // invalid - semicolon between coordinates
      '91, -181, -91',   // invalid - missing a coordinate
      '123,12',          // invalid - missing coordinates
      ''                 // invalid - empty param
    ],
    valid: [
      '-179,90,34,-80', // valid top_right lon/lat, bottom_left lon/lat
      '0,0,0,0' // valid top_right lat/lon, bottom_left lat/lon
    ]
    
  };
  test('invalid bbox coordinates', function(t) {  
    bboxes.invalid_coordinates.forEach( function( bbox ){
      sanitize({ text: 'test', lat: 0, lon: 0, bbox: bbox }, function( err, clean ){
        t.equal(err, 'invalid bbox', bbox + ' is invalid');
        t.equal(clean, undefined, 'clean not set');
      });
    });
    t.end();
  });
  test('invalid bbox', function(t) {  
    bboxes.invalid.forEach( function( bbox ){
      sanitize({ text: 'test', lat: 0, lon: 0, bbox: bbox }, function( err, clean ){
        var expected = JSON.parse(JSON.stringify( defaultClean ));
        t.equal(err, undefined, 'no error');
        expected.parsed_text = parser('test');
        t.deepEqual(clean, expected, 'falling back on 50km distance from centroid');
      });
    });
    t.end();
  });
  test('valid bbox', function(t) {  
    bboxes.valid.forEach( function( bbox ){
      sanitize({ text: 'test', lat: 0, lon: 0, bbox: bbox }, function( err, clean ){
        var expected = JSON.parse(JSON.stringify( defaultClean ));
        var bboxArray = bbox.split(',').map(function(i) {
          return parseInt(i);
        });
        expected.bbox = {
          right: Math.max(bboxArray[0], bboxArray[2]),
          top: Math.max(bboxArray[1], bboxArray[3]),
          left: Math.min(bboxArray[0], bboxArray[2]),
          bottom: Math.min(bboxArray[1], bboxArray[3])
        };
        t.equal(err, undefined, 'no error');
        expected.parsed_text = parser('test');
        t.deepEqual(clean, expected, 'clean set correctly (' + bbox + ')');
      });
    });
    t.end();
  });
};

module.exports.tests.sanitize_zoom = function(test, common) {
  test('invalid zoom value', function(t) {
    sanitize({ zoom: 'a', text: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.equal(clean.zoom, undefined, 'zoom not set');
      t.end();
    });
  });
  test('below min zoom value', function(t) {
    sanitize({ zoom: -100, text: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.equal(clean.zoom, 1, 'min zoom set');
      t.end();
    });
  });
  test('above max zoom value', function(t) {
    sanitize({ zoom: 9999, text: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.equal(clean.zoom, 18, 'max zoom set');
      t.end();
    });
  });
};

module.exports.tests.sanitize_size = function(test, common) {
  test('invalid size value', function(t) {
    sanitize({ size: 'a', text: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.equal(clean.size, 10, 'default size set');
      t.end();
    });
  });
  test('below min size value', function(t) {
    sanitize({ size: -100, text: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.equal(clean.size, 1, 'min size set');
      t.end();
    });
  });
  test('above max size value', function(t) {
    sanitize({ size: 9999, text: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.equal(clean.size, 40, 'max size set');
      t.end();
    });
  });
};

module.exports.tests.sanitize_details = function(test, common) {
  var invalid_values = [null, -1, 123, NaN, 'abc'];
  invalid_values.forEach(function(details) {
    test('invalid details param ' + details, function(t) {
      sanitize({ text: 'test', lat: 0, lon: 0, details: details }, function( err, clean ){
        t.equal(clean.details, false, 'default details set (to false)');
        t.end();
      });
    });  
  });

  var valid_values = ['true', true, 1];
  valid_values.forEach(function(details) {
    test('valid details param ' + details, function(t) {
      sanitize({ text: 'test', lat: 0, lon: 0, details: details }, function( err, clean ){
        t.equal(clean.details, true, 'details set to true');
        t.end();
      });
    });  
  });

  var valid_false_values = ['false', false, 0];
  valid_false_values.forEach(function(details) {
    test('test setting false explicitly ' + details, function(t) {
      sanitize({ text: 'test', lat: 0, lon: 0, details: details }, function( err, clean ){
        t.equal(clean.details, false, 'details set to false');
        t.end();
      });
    }); 
  });

  test('test default behavior', function(t) {
    sanitize({ text: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.equal(clean.details, true, 'details set to true');
      t.end();
    });
  });
};

module.exports.tests.sanitize_layers = function(test, common) {
  test('unspecified', function(t) {
    sanitize({ layers: undefined, text: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.deepEqual(clean.layers, defaultClean.layers, 'default layers set');
      t.end();
    });
  });
  test('invalid layer', function(t) {
    sanitize({ layers: 'test_layer', text: 'test', lat: 0, lon: 0 }, function( err, clean ){
      var msg = 'invalid param \'layers\': must be one or more of ';
      t.true(err.match(msg), 'invalid layer requested');
      t.true(err.length > msg.length, 'invalid error message');
      t.end();
    });
  });
  test('poi (alias) layer', function(t) {
    var poi_layers = ['geoname','osmnode','osmway'];
    sanitize({ layers: 'poi', text: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.deepEqual(clean.layers, poi_layers, 'poi layers set');
      t.end();
    });
  });
  test('admin (alias) layer', function(t) {
    var admin_layers = ['admin0','admin1','admin2','neighborhood','locality','local_admin'];
    sanitize({ layers: 'admin', text: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.deepEqual(clean.layers, admin_layers, 'admin layers set');
      t.end();
    });
  });
  test('address (alias) layer', function(t) {
    var address_layers = ['osmaddress','openaddresses'];
    sanitize({ layers: 'address', text: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.deepEqual(clean.layers, address_layers, 'address layers set');
      t.end();
    });
  });
  test('poi alias layer plus regular layers', function(t) {
    var poi_layers = ['geoname','osmnode','osmway'];
    var reg_layers = ['admin0', 'admin1'];
    sanitize({ layers: 'poi,admin0,admin1', text: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.deepEqual(clean.layers, reg_layers.concat(poi_layers), 'poi + regular layers');
      t.end();
    });
  });
  test('admin alias layer plus regular layers', function(t) {
    var admin_layers = ['admin0','admin1','admin2','neighborhood','locality','local_admin'];
    var reg_layers   = ['geoname', 'osmway'];
    sanitize({ layers: 'admin,geoname,osmway', text: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.deepEqual(clean.layers, reg_layers.concat(admin_layers), 'admin + regular layers set');
      t.end();
    });
  });
  test('address alias layer plus regular layers', function(t) {
    var address_layers = ['osmaddress','openaddresses'];
    var reg_layers   = ['geoname', 'osmway'];
    sanitize({ layers: 'address,geoname,osmway', text: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.deepEqual(clean.layers, reg_layers.concat(address_layers), 'address + regular layers set');
      t.end();
    });
  });
  test('alias layer plus regular layers (no duplicates)', function(t) {
    var poi_layers = ['geoname','osmnode','osmway'];
    sanitize({ layers: 'poi,geoname,osmnode', text: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.deepEqual(clean.layers, poi_layers, 'poi layers found (no duplicates)');
      t.end();
    });
  });
  test('multiple alias layers (no duplicates)', function(t) {
    var alias_layers = ['geoname','osmnode','osmway','admin0','admin1','admin2','neighborhood','locality','local_admin'];
    sanitize({ layers: 'poi,admin', text: 'test', lat: 0, lon: 0 }, function( err, clean ){
      t.deepEqual(clean.layers, alias_layers, 'all layers found (no duplicates)');
      t.end();
    });
  });
};

module.exports.tests.invalid_params = function(test, common) {
  test('invalid text params', function(t) {
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
    var req = { query: { text: 'test', lat: 0, lon: 0 }};
    var next = function( message ){
      t.equal(message, undefined, 'no error message set');
      req.clean.parsed_text = parser('test');
      t.deepEqual(req.clean, defaultClean);
      t.end();
    };
    middleware( req, undefined, next );
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('SANTIZE /suggest ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};