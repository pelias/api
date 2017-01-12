
var fs = require('fs'),
    tmp = require('tmp'),
    setup = require('../../../service/interpolation').search;

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof setup, 'function', 'setup is a function');
    t.end();
  });
};

// adapter factory
module.exports.tests.factory = function(test, common) {

  test('http adapter', function(t) {
    var config = { interpolation: { client: {
      adapter: 'http',
      host: 'http://example.com'
    }}};

    // adapter is driven by config
    var tmpfile = tmp.tmpNameSync({ postfix: '.json' });
    fs.writeFileSync( tmpfile, JSON.stringify( config ), { encoding: 'utf8' } );
    process.env.PELIAS_CONFIG = tmpfile;
    var adapter = setup();
    delete process.env.PELIAS_CONFIG;

    t.equal(adapter.constructor.name, 'HttpTransport', 'HttpTransport');
    t.equal(typeof adapter, 'object', 'adapter is an object');
    t.equal(typeof adapter.query, 'function', 'query is a function');
    t.equal(adapter.query.length, 4, 'query function signature');
    t.end();
  });

  test('require adapter', function(t) {
    var config = { interpolation: { client: {
      adapter: 'require',
      addressdb: '/tmp/address.db',
      streetdb: '/tmp/street.db'
    }}};

    // adapter is driven by config
    var tmpfile = tmp.tmpNameSync({ postfix: '.json' });
    fs.writeFileSync( tmpfile, JSON.stringify( config ), { encoding: 'utf8' } );
    process.env.PELIAS_CONFIG = tmpfile;
    var adapter = setup();
    delete process.env.PELIAS_CONFIG;

    t.equal(adapter.constructor.name, 'RequireTransport', 'RequireTransport');
    t.equal(typeof adapter, 'object', 'adapter is an object');
    t.equal(typeof adapter.query, 'function', 'query is a function');
    t.equal(adapter.query.length, 4, 'query function signature');
    t.end();
  });

  test('null adapter', function(t) {
    var config = { interpolation: { client: {
      adapter: 'null'
    }}};

    // adapter is driven by config
    var tmpfile = tmp.tmpNameSync({ postfix: '.json' });
    fs.writeFileSync( tmpfile, JSON.stringify( config ), { encoding: 'utf8' } );
    process.env.PELIAS_CONFIG = tmpfile;
    var adapter = setup();
    delete process.env.PELIAS_CONFIG;

    t.equal(adapter.constructor.name, 'NullTransport', 'NullTransport');
    t.equal(typeof adapter, 'object', 'adapter is an object');
    t.equal(typeof adapter.query, 'function', 'query is a function');
    t.equal(adapter.query.length, 4, 'query function signature');
    t.end();
  });

  test('default adapter', function(t) {
    var config = {};

    // adapter is driven by config
    var tmpfile = tmp.tmpNameSync({ postfix: '.json' });
    fs.writeFileSync( tmpfile, JSON.stringify( config ), { encoding: 'utf8' } );
    process.env.PELIAS_CONFIG = tmpfile;
    var adapter = setup();
    delete process.env.PELIAS_CONFIG;

    t.equal(adapter.constructor.name, 'NullTransport', 'NullTransport');
    t.equal(typeof adapter, 'object', 'adapter is an object');
    t.equal(typeof adapter.query, 'function', 'query is a function');
    t.equal(adapter.query.length, 4, 'query function signature');
    t.end();
  });

};

// null transport
module.exports.tests.NullTransport = function(test, common) {

  test('null transport', function(t) {

    // adapter is driven by config
    var tmpfile = tmp.tmpNameSync({ postfix: '.json' });
    fs.writeFileSync( tmpfile, '{}', { encoding: 'utf8' } );
    process.env.PELIAS_CONFIG = tmpfile;
    var adapter = setup();
    delete process.env.PELIAS_CONFIG;

    // test null transport performs a no-op
    adapter.query( null, null, null, function( err, res ){
      t.equal(err, undefined, 'no-op');
      t.equal(res, undefined, 'no-op');
      t.end();
    });
  });

};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('SERVICE interpolation', testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
