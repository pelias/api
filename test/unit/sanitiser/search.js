var extend = require('extend'),
    search  = require('../../../sanitiser/search'),
    parser = require('../../../helper/text_parser'),
    _ = require('lodash'),
    sanitize = search.sanitize,
    middleware = search.middleware,
    defaultError = 'invalid param \'text\': text length, must be >0';
// these are the default values you would expect when no input params are specified.
var emptyClean = { private: false, size: 10 };

function makeRequest(method, query) {
  if(method === 'GET') {
    return { query: query, method: method };
  } else if(method === 'POST'){
    return { body: query, method: method };
  } else {
    throw new Error('Method must be GET or POST, saw ' + method);
  }
}

module.exports.tests = {};

module.exports.tests.interface = function(test, common, method) {
  test('sanitize interface', function(t) {
    t.equal(typeof sanitize, 'function', 'sanitize is a function');
    t.equal(sanitize.length, 2, 'sanitize interface');
    t.end();
  });
  test('middleware interface', function(t) {
    t.equal(typeof middleware, 'function', 'middleware is a function');
    t.equal(middleware.length, 3, 'sanitize has a valid middleware');
    t.end();
  });
};

module.exports.tests.sanitisers = function(test, common, method) {
  test('check sanitiser list', function (t) {
    var expected = ['singleScalarParameters', 'text', 'size', 'layers', 'sources',
      'sources_and_layers', 'private', 'geo_search', 'boundary_country' ];
    t.deepEqual(Object.keys(search.sanitiser_list), expected);
    t.end();
  });
};

module.exports.tests.sanitize_invalid_text = function(test, common, method) {
  test('invalid text', function(t) {
    var invalid = [ '', 100, null, undefined ];
    invalid.forEach( function( text ){
      var req = makeRequest(method, { text: text });
      sanitize(req, function(){
        t.equal(req.errors[0][0], 'invalid param \'text\': text length, must be >0', text + ' is an invalid text');
        t.deepEqual(req.clean, [emptyClean], 'clean only has default values set');
      });
    });
    t.end();
  });
};

module.exports.tests.sanitize_invalid_text_array = function(test, common, method) {
  if(method !== 'POST') { return; }
  test('invalid text array', function(t) {
    var invalid = [ '', 100, null, undefined ].map(function(text) { return { text: text }; });
    var req = makeRequest(method, invalid);
    sanitize(req, function(){
      t.equal(req.clean.length, invalid.length);
      invalid.forEach(function(text, index) {
        t.equal(req.errors[index][0], 'invalid param \'text\': text length, must be >0', text + ' is an invalid text');
        t.deepEqual(req.clean[index], emptyClean, 'clean only has default values set');
      });
    });
    t.end();
  });
};

module.exports.tests.sanitise_valid_text = function(test, common, method) {
  test('valid short text', function(t) {
    var req = makeRequest(method, { text: 'a' });
    sanitize(req, function(){
      t.equal(req.errors[0], undefined, 'no error');
    });
    t.end();
  });

  test('valid not-quite-as-short text', function(t) {
    var req = makeRequest(method, { text: 'aa' });
    sanitize(req, function(){
      t.equal(req.errors[0], undefined, 'no error');
    });
    t.end();
  });

  test('valid longer text', function(t) {
    var req = makeRequest(method, { text: 'aaaaaaaa' });
    sanitize(req, function(){
      t.equal(req.errors[0], undefined, 'no error');
    });
    t.end();
  });
};

module.exports.tests.sanitize_text_array = function(test, common, method) {
  if(method !== 'POST') { return; }

  test('valid text array', function(t) {
    var data = [ {text: 'aaaaa'}, {text: 'bbbbb'} ];
    var req = makeRequest(method, data);
    sanitize(req, function() {
      data.forEach(function(data, index) {
        var expectedClean = _.assign({text: data.text}, emptyClean);
        t.equal(req.errors[index], undefined, 'no error on item ' + index);
      });
    });
    t.end();
  });

  test('one invalid item of three total', function(t) {
    var data = [ 'aaaaa', 100, 'bbbbb' ];
    var dataRequests = data.map(function(text) { return { text: text }; });
    var req = makeRequest(method, dataRequests);
    sanitize(req, function() {
      t.equal(req.clean.length, 3, 'one clean for each item');
      data.forEach(function(text, index) {
        if(Number.isInteger(text)) {
          t.true(Array.isArray(req.errors[index]), 'errors[' + index + '] is set');
          t.equal(req.errors[index][0], 'invalid param \'text\': text length, must be >0', text + ' is an invalid text');
          t.deepEqual(req.clean[index], emptyClean, 'clean only has default values set');
        } else {
          var expectedClean = _.assign({text: text}, emptyClean);
          t.equal(req.errors[index], undefined, 'no error on item ' + index);
          t.deepEqual(req.clean[index], expectedClean, 'clean only has default values set');
        }
      });
    });
    t.end();
  });
};

module.exports.tests.sanitize_text_with_delim = function(test, common, method) {
  var texts = [ 'a,bcd', '123 main st, region', ',,,', ' ' ];

  test('valid texts with a comma', function(t) {
    texts.forEach( function( text ){
      var req = makeRequest(method, { text: text });
      sanitize( req, function( ){
        var expected_text = text;

        var expected_parsed_text = parser.get_parsed_address(text);
        t.equal(req.errors[0], undefined, 'no error');
        t.equal(req.clean[0].parsed_text.name, expected_parsed_text.name, 'clean name set correctly');
        t.equal(req.clean[0].text, expected_text, 'text should match');

      });
    });
    t.end();
  });

  if(method === 'POST') {
    test('valid texts array with a comma', function(t) {
      var textsArray = texts.map(function(text) { return { text: text }; } );
      var req = makeRequest(method, textsArray);

      sanitize( req, function( ){
        t.equal(req.clean.length, texts.length, 'clean has correct length');
        req.clean.forEach(function(clean, index) {

          var expected_text = texts[index];
          var expected_parsed_text = parser.get_parsed_address(expected_text);
          t.equal(req.errors[index], undefined, 'no error');
          t.equal(req.clean[index].parsed_text.name, expected_parsed_text.name, 'clean name set correctly');
          t.equal(req.clean[index].text, expected_text, 'text should match');
        });

      });
      t.end();
    });
  }
};

module.exports.tests.sanitize_private_no_value = function(test, common, method) {
  test('default private should be set to true', function(t) {
    var req = makeRequest(method, { text: 'test' });
    sanitize(req, function(){
      t.equal(req.clean[0].private, false, 'private set to false');
    });
    t.end();
  });
};

module.exports.tests.sanitize_private_explicit_true_value = function(test, common, method) {
  test('explicit private should be set to true', function(t) {
    var req = makeRequest(method, { text: 'test', private: true });
    sanitize(req, function(){
      t.equal(req.clean[0].private, true, 'private set to true');
    });
    t.end();
  });
};

module.exports.tests.sanitize_private_explicit_false_value = function(test, common, method) {
  test('explicit private should be set to false', function(t) {
    var req = makeRequest(method, { text: 'test', private: false });
    sanitize(req, function(){
      t.equal(req.clean[0].private, false, 'private set to false');
    });
    t.end();
  });
};

module.exports.tests.sanitize_lat = function(test, common, method) {
  var valid_lats = [ 0, 45, 90, -0, '0', '45', '90', -181, -120, -91, 91, 120, 181  ];
  test('valid lat', function(t) {
    valid_lats.forEach( function( lat ){
      var req = makeRequest(method, { text: 'test', 'focus.point.lat': lat, 'focus.point.lon': 0 });
      sanitize(req, function(){
        var expected_lat = parseFloat( lat );
        t.equal(req.errors[0], undefined, 'no error');
        t.equal(req.clean[0]['focus.point.lat'], expected_lat, 'clean lat set correctly (' + lat + ')');
      });
    });
    t.end();
  });
};

module.exports.tests.sanitize_lon = function(test, common, method) {
  var lons = {
    valid: [ -381, -181, -180, -1, -0, 0, 45, 90, '-180', '0', '180', 181 ]
  };
  test('valid lon', function(t) {
    lons.valid.forEach( function( lon ){
      var req = makeRequest(method, { text: 'test', 'focus.point.lat': 0, 'focus.point.lon': lon });
      sanitize( req, function(){
        var expected_lon = parseFloat( lon );
        t.equal(req.errors[0], undefined, 'no error');
        t.deepEqual(req.clean[0]['focus.point.lon'], expected_lon, 'clean set correctly (' + lon + ')');
      });
    });
    t.end();
  });
};

module.exports.tests.sanitize_optional_geo = function(test, common, method) {
  test('no lat/lon', function(t) {
    var req = makeRequest(method, { text: 'test' });
    sanitize(req, function(){
      t.equal(req.errors[0], undefined, 'no error');
      t.equal(req.clean[0]['focus.point.lat'], undefined, 'clean set without lat');
      t.equal(req.clean[0]['focus.point.lon'], undefined, 'clean set without lon');
    });
    t.end();
  });
  test('no lat', function(t) {
    var req = makeRequest(method, { text: 'test', 'focus.point.lon': 0 });
    sanitize(req, function(){
      var expected_lon = 0;
      t.equal(req.errors[0][0], 'parameters focus.point.lat and focus.point.lon must both be specified');
      t.equal(req.clean[0]['focus.point.lat'], undefined);
      t.equal(req.clean[0]['focus.point.lon'], undefined);
    });
    t.end();
  });
  test('no lon', function(t) {
    var req = makeRequest(method, { text: 'test', 'focus.point.lat': 0 });
    sanitize(req, function(){
      var expected_lat = 0;
      t.equal(req.errors[0][0], 'parameters focus.point.lat and focus.point.lon must both be specified');
      t.equal(req.clean[0]['focus.point.lat'], undefined);
      t.equal(req.clean[0]['focus.point.lon'], undefined);
    });
    t.end();
  });
};

module.exports.tests.sanitize_bounding_rect = function(test, common, method) {
  test('valid bounding rect', function(t) {
    var q = {
        text: 'test',
        'boundary.rect.min_lat': -40.659,
        'boundary.rect.max_lat': -41.614,
        'boundary.rect.min_lon': 174.612,
        'boundary.rect.max_lon': 176.333
      };
    var req = makeRequest(method, q);

    sanitize(req, function(){
      t.equal(req.errors[0], undefined, 'no error');
      t.equal(req.clean[0]['boundary.rect.min_lon'], parseFloat(q['boundary.rect.min_lon']));
      t.equal(req.clean[0]['boundary.rect.max_lat'], parseFloat(q['boundary.rect.max_lat']));
      t.equal(req.clean[0]['boundary.rect.max_lon'], parseFloat(q['boundary.rect.max_lon']));
      t.equal(req.clean[0]['boundary.rect.min_lat'], parseFloat(q['boundary.rect.min_lat']));
      t.end();
    });
  });
};

module.exports.tests.sanitize_viewport = function(test, common, method) {
  test('valid viewport', function(t) {
    var q = {
        text: 'test',
        'focus.viewport.min_lat': '37',
        'focus.viewport.max_lat': '38',
        'focus.viewport.min_lon': '-123',
        'focus.viewport.max_lon': '-122'
      };
    var req = makeRequest(method, q);

    sanitize(req, function() {
      t.equal(req.errors[0], undefined, 'no error');
      t.equal(req.clean[0]['focus.viewport.min_lat'], parseFloat(q['focus.viewport.min_lat']), 'correct min_lat in clean');
      t.equal(req.clean[0]['focus.viewport.max_lat'], parseFloat(q['focus.viewport.max_lat']), 'correct max_lat in clean');
      t.equal(req.clean[0]['focus.viewport.min_lon'], parseFloat(q['focus.viewport.min_lon']), 'correct min_lon in clean');
      t.equal(req.clean[0]['focus.viewport.max_lon'], parseFloat(q['focus.viewport.max_lon']), 'correct max_lon in clean');
      t.end();
    });
  });

  test('error returned if focus.point and focus.viewpoint specified', function(t) {
    var q = {
        text: 'test',
        'focus.point.lat': '10',
        'focus.point.lon': '15',
        'focus.viewport.min_lat': '37',
        'focus.viewport.max_lat': '38',
        'focus.viewport.min_lon': '-123',
        'focus.viewport.max_lon': '-122'
      };
    var req = makeRequest(method, q);

    sanitize(req, function() {
      t.equal(req.errors[0][0], 'focus.point and focus.viewport can\'t both be set', 'no error');
      t.notOk(req.clean[0].hasOwnProperty('focus.viewport.min_lat'), 'clean should be empty');
      t.notOk(req.clean[0].hasOwnProperty('focus.viewport.max_lat'), 'clean should be empty');
      t.notOk(req.clean[0].hasOwnProperty('focus.viewport.min_lon'), 'clean should be empty');
      t.notOk(req.clean[0].hasOwnProperty('focus.viewport.max_lon'), 'clean should be empty');
      t.notOk(req.clean[0].hasOwnProperty('focus.point.lat'), 'clean should be empty');
      t.notOk(req.clean[0].hasOwnProperty('focus.point.lon'), 'clean should be empty');
      t.end();
    });
  });

  test('error returned if focus.point and focus.viewpoint partially specified', function(t) {
    var req = makeRequest(method, {
        text: 'test',
        'focus.point.lat': '10',
        'focus.viewport.min_lat': '37',
        'focus.viewport.max_lon': '-122'
      });

    sanitize(req, function() {
      t.equal(req.errors[0][0], 'focus.point and focus.viewport can\'t both be set', 'no error');
      t.notOk(req.clean[0].hasOwnProperty('focus.viewport.min_lat'), 'clean should be empty');
      t.notOk(req.clean[0].hasOwnProperty('focus.viewport.max_lat'), 'clean should be empty');
      t.notOk(req.clean[0].hasOwnProperty('focus.viewport.min_lon'), 'clean should be empty');
      t.notOk(req.clean[0].hasOwnProperty('focus.viewport.max_lon'), 'clean should be empty');
      t.notOk(req.clean[0].hasOwnProperty('focus.point.lat'), 'clean should be empty');
      t.notOk(req.clean[0].hasOwnProperty('focus.point.lon'), 'clean should be empty');
      t.end();
    });
  });
};

module.exports.tests.sanitize_size = function(test, common, method) {
  test('invalid size value', function(t) {
    var req = makeRequest(method, { size: 'a', text: 'test', lat: 0, lon: 0 });
    sanitize(req, function(){
      t.equal(req.clean[0].size, 10, 'default size set');
      t.end();
    });
  });
  test('below min size value', function(t) {
    var req = makeRequest(method, { size: -100, text: 'test', lat: 0, lon: 0 });
    sanitize(req, function(){
      t.equal(req.clean[0].size, 1, 'min size set');
      t.end();
    });
  });
  test('above max size value', function(t) {
    var req = makeRequest(method, { size: 9999, text: 'test', lat: 0, lon: 0 });
    sanitize(req, function(){
      t.equal(req.clean[0].size, 40, 'max size set');
      t.end();
    });
  });
};

module.exports.tests.sanitize_private = function(test, common, method) {
  var invalid_values = [null, -1, 123, NaN, 'abc'];
  invalid_values.forEach(function(value) {
    test('invalid private param ' + value, function(t) {
      var req = makeRequest(method, { text: 'test', lat: 0, lon: 0, 'private': value });
      sanitize(req, function(){
        t.equal(req.clean[0].private, false, 'default private set (to false)');
        t.end();
      });
    });
  });

  var valid_values = ['true', true, 1, '1'];
  valid_values.forEach(function(value) {
    test('valid private ' + value, function(t) {
      var req = makeRequest(method, { text: 'test', 'private': value });
      sanitize(req, function(){
        t.equal(req.clean[0].private, true, 'private set to true');
        t.end();
      });
    });
  });

  var valid_false_values = ['false', false, 0, '0'];
  valid_false_values.forEach(function(value) {
    test('test setting false explicitly ' + value, function(t) {
      var req = makeRequest(method, { text: 'test', 'private': value });
      sanitize(req, function(){
        t.equal(req.clean[0].private, false, 'private set to false');
        t.end();
      });
    });
  });

  test('test default behavior', function(t) {
    var req = makeRequest(method, { text: 'test' });
    sanitize(req, function(){
      t.equal(req.clean[0].private, false, 'private set to false');
      t.end();
    });
  });
};

module.exports.tests.invalid_params = function(test, common, method) {
  test('invalid text params', function(t) {
    var req = makeRequest(method, {});
    sanitize( req, function(){
      t.equal(req.errors[0][0], defaultError, 'handle invalid params gracefully');
      t.end();
    });
  });
};

module.exports.tests.middleware_success = function(test, common, method) {
  test('middleware success', function(t) {
    var req = makeRequest(method, { text: 'test' });
    var next = function( message ){
      t.deepEqual(req.errors, [], 'no error messages set');
      t.end();
    };
    middleware( req, undefined, next );
  });
};

module.exports.all = function (tape, common) {

  function testGet(name, testFunction) {
    return tape('SANITIZE GET /search ' + name, testFunction);
  }

  function testPost(name, testFunction) {
    return tape('SANITIZE POST /search ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](testGet, common, 'GET');
    module.exports.tests[testCase](testPost, common, 'POST');
  }
};
