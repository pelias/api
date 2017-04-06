
var fs = require('fs'),
    tmp = require('tmp'),
    setup = require('../../../middleware/changeLanguage');

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

module.exports.tests.isLanguageChangeRequired = function(test, common) {
  test('invalid query - null req/res', function(t) {
    var middleware = load();
    middleware(null, null, t.end);
  });

  test('invalid query - no results', function(t) {
    var req = { language: { iso6393: 'spa' } };
    var res = {};

    var middleware = load();
    middleware(req, res, function(){
      t.deepEqual( req, { language: { iso6393: 'spa' } } );
      t.deepEqual( res, {} );
      t.end();
    });
  });

  test('invalid query - empty results', function(t) {
    var req = { language: { iso6393: 'spa' } };
    var res = { data: [] };

    var middleware = load();
    middleware(req, res, function(){
      t.deepEqual( req, { language: { iso6393: 'spa' } } );
      t.deepEqual( res, { data: [] } );
      t.end();
    });
  });

  test('invalid query - no target language', function(t) {
    var req = {};
    var res = { data: [] };

    var middleware = load();
    middleware(req, res, function(){
      t.deepEqual( req, {} );
      t.deepEqual( res, { data: [] } );
      t.end();
    });
  });
};

// check the service is called and response mapped correctly
module.exports.tests.miss = function(test, common) {
  test('miss', function(t) {

    var req = { language: { iso6393: 'spa' } };
    var res = { data: [
      {
        layer: 'locality',
        name: { default: 'London' },
        parent: {
          locality_id: [ 101750367 ],
          locality: [ 'London' ]
        }
      },
      {
        layer: 'example',
        name: { default: 'London' },
        parent: {
          locality_id: [ 101735809 ],
          locaity: [ 'London' ]
        }
      }
    ]};

    var middleware = load();

    // mock out the transport
    middleware.transport.query = function mock( ids, cb ){
      t.deepEqual( ids, [ '101735809', '101750367' ] );
      t.equal( typeof cb, 'function' );
      cb( 'error' );
    };

    middleware(req, res, function(){
      t.deepEqual( res, { data: [
        {
          layer: 'locality',
          name: { default: 'London' },
          parent: {
            locality_id: [ 101750367 ],
            locality: [ 'London' ]
          }
        },
        {
          layer: 'example',
          name: { default: 'London' },
          parent: {
            locality_id: [ 101735809 ],
            locaity: [ 'London' ]
          }
        }
      ]});
      t.end();
    });
  });
};

// check the service is called and response mapped correctly
module.exports.tests.hit = function(test, common) {
  test('hit', function(t) {

    var req = { language: { iso6393: 'spa' } };
    var res = { data: [
      {
        layer: 'locality',
        name: { default: 'London' },
        parent: {
          locality_id: [ 101750367 ],
          locality: [ 'London' ]
        }
      },
      {
        layer: 'example',
        name: { default: 'London' },
        parent: {
          locality_id: [ 101735809 ],
          locaity: [ 'London' ]
        }
      }
    ]};

    var middleware = load();

    // mock out the transport
    middleware.transport.query = function mock( ids, cb ){
      t.deepEqual( ids, [ '101735809', '101750367' ] );
      t.equal( typeof cb, 'function' );
      cb( null, {
        '101750367': {
          'names': {
            'default':'London',
            'chi':'倫敦',
            'spa':'Londres',
            'eng':'London',
            'hin':'लंदन',
            'ara':'لندن',
            'por':'Londres',
            'ben':'লন্ডন',
            'rus':'Лондон',
            'jpn':'ロンドン',
            'kor':'런던'
          }
        },
        '101735809': {
          'names':{
            'default':'London',
            'eng':'London'
          }
        }
      });
    };

    middleware(req, res, function(){
      t.deepEqual( res, { data: [
        {
          layer: 'locality',
          name: { default: 'Londres' },
          parent: {
            locality_id: [ 101750367 ],
            locality: [ 'Londres' ]
          }
        },
        {
          layer: 'example',
          name: { default: 'London' },
          parent: {
            locality_id: [ 101735809 ],
            locaity: [ 'London' ]
          }
        }
      ]});
      t.end();
    });
  });
};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('[middleware] changeLanguage: ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};
