
var fs = require('fs'),
    tmp = require('tmp'),
    setup = require('../../../middleware/interpolate');

// load middleware using the default pelias config
var load = function(){
  // adapter is driven by config
  var tmpfile = tmp.tmpNameSync({ postfix: '.json' });
  fs.writeFileSync( tmpfile, '{}', { encoding: 'utf8' } );
  process.env.PELIAS_CONFIG = tmpfile;
  var middleware = setup();
  delete process.env.PELIAS_CONFIG;
  return middleware;
};

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    var middleware = load();
    t.equal(typeof middleware, 'function', 'middleware is a function');
    t.equal(middleware.length, 3, 'middleware is a function');
    t.end();
  });
};

module.exports.tests.isAddressQuery = function(test, common) {
  test('invalid address query - no parsed text', function(t) {
    var req = { clean: {} };

    var middleware = load();
    middleware(req, null, t.end);
  });

  test('invalid address query - no number', function(t) {
    var req = { clean: {
      parsed_text: {
        street: 'sesame st'
      }}
    };

    var middleware = load();
    middleware(req, null, t.end);
  });

  test('invalid address query - no street', function(t) {
    var req = { clean: {
      parsed_text: {
        number: '1',
      }}
    };

    var middleware = load();
    middleware(req, null, t.end);
  });
};

// test results are correctly mapped to the transport
module.exports.tests.map = function(test, common) {
  test('documents mapped to transport: no hits', function(t) {
    var req = { clean: {
      parsed_text: {
        number: '1',
        street: 'sesame st'
      }}
    };
    var res = { data: [] };

    var middleware = load();
    middleware(req, res, function(){
      t.deepEqual( res, { data: [] } );
      t.end();
    });
  });
  test('documents mapped to transport: no street layer hits', function(t) {
    var req = { clean: {
      parsed_text: {
        number: '1',
        street: 'sesame st'
      }}
    };
    var res = { data: [{ layer: 'foo' }] };

    var middleware = load();
    middleware(req, res, function(){
      t.deepEqual( res, { data: [{ layer: 'foo' }] } );
      t.end();
    });
  });
};

// check the service is called and response mapped correctly
module.exports.tests.miss = function(test, common) {
  test('miss', function(t) {

    var req = { clean: {
      parsed_text: {
        number: '1',
        street: 'sesame st'
      }}
    };
    var res = { data: [
      {
        layer: 'street',
        center_point: { lat: 1, lon: 1 },
        address_parts: { street: 'sesame rd' },
        name: { default: 'example' }
      }
    ]};

    var middleware = load();

    // mock out the transport
    middleware.transport.query = function mock( coord, number, street, cb ){
      t.deepEqual( coord, res.data[0].center_point );
      t.deepEqual( number, req.clean.parsed_text.number );
      t.deepEqual( street, res.data[0].address_parts.street );
      t.equal( typeof cb, 'function' );
      cb( 'error' );
    };

    middleware(req, res, function(){
      t.deepEqual( res, { data: [
        {
          layer: 'street',
          center_point: { lat: 1, lon: 1 },
          address_parts: { street: 'sesame rd' },
          name: { default: 'example' }
        }
      ]});
      t.end();
    });
  });
};

// check the service is called and response mapped correctly
module.exports.tests.hit = function(test, common) {
  test('hit', function(t) {

    var req = { clean: {
      parsed_text: {
        number: '1',
        street: 'sesame st'
      }}
    };
    var res = { data: [
      {
        layer: 'street',
        center_point: { lat: 1, lon: 1 },
        address_parts: { street: 'sesame rd' },
        name: { default: 'street name' },
        source_id: '123456'
      }
    ]};

    var middleware = load();

    // mock out the transport
    middleware.transport.query = function mock( coord, number, street, cb ){
      t.deepEqual( coord, res.data[0].center_point );
      t.deepEqual( number, req.clean.parsed_text.number );
      t.deepEqual( street, res.data[0].address_parts.street );
      t.equal( typeof cb, 'function' );
      cb( null, {
        properties: {
          number: '100A',
          source: 'OSM',
          source_id: 'way:111111',
          lat: 22.2,
          lon: -33.3,
        }
      });
    };

    middleware(req, res, function(){
      t.deepEqual( res, { data: [
        {
          layer: 'address',
          match_type: 'interpolated',
          center_point: { lat: 22.2, lon: -33.3 },
          address_parts: { street: 'sesame rd', number: '100A' },
          name: { default: '100A street name' },
          source: 'openstreetmap',
          source_id: 'way:111111'
        }
      ]});
      t.end();
    });
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('[middleware] interpolate: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
