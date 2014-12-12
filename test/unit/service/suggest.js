
var setup = require('../../../service/suggest'),
    mockBackend = require('../mock/backend');

var example_valid_es_query = { body: { a: 'b' }, index: 'pelias' };

module.exports.tests = {};

module.exports.tests.interface = function(test, common) {
  test('valid interface', function(t) {
    t.equal(typeof setup, 'function', 'setup is a function');
    t.end();
  });
};

// functionally test service 
module.exports.tests.functional_success = function(test, common) {

  var expected = [ 
    { score: 1, text: 'mocktype:mockid1' }, 
    { score: 2, text: 'mocktype:mockid2' } 
  ];

  test('valid ES query', function(t) {
    var backend = mockBackend( 'client/suggest/ok/1', function( cmd ){
      t.deepEqual(cmd, example_valid_es_query, 'no change to the command');
    });
    setup( backend, example_valid_es_query, function(err, data) {
      t.true(Array.isArray(data), 'returns an array');
      data.forEach(function(d) {
        t.true(typeof d === 'object', 'valid object');
      });
      // t.deepEqual(data, expected, 'values correctly mapped');
      t.end();
    });
  });

};

// functionally test service
module.exports.tests.functional_failure = function(test, common) {

  test('invalid ES query', function(t) {
    var invalid_queries = [
      {  },
      { foo: 'bar' }
    ];

    var backend = mockBackend( 'client/suggest/fail/1', function( cmd ){
      t.notDeepEqual(cmd, example_valid_es_query, 'incorrect backend command');
    });
    invalid_queries.forEach(function(query) {
      setup( backend, [ query ], function(err, data) {
        t.equal(err, 'a backend error occurred','error passed to errorHandler');
        t.equal(data, undefined, 'data is undefined');
      });
    });
    t.end();
  });

};

module.exports.all = function (tape, common) {

  function test(name, testFunction) {
    return tape('SERVICE /suggest ' + name, testFunction);
  }

  for( var testCase in module.exports.tests ){
    module.exports.tests[testCase](test, common);
  }
};