
var helper = require('../helper/suggest');
var async = require('async');

function setup( backend, query, query_mixer ){

  // allow overriding of dependencies
  backend = backend || require('../src/backend');
  query = query || require('../query/suggest');
  query_mixer = query_mixer || require('../helper/queryMixer').suggest;

  function controller( req, res, next ){
    var suggest = helper(backend, res, next);

    var cmd = {
      index: 'pelias',
      body: query( req.clean )
    };

    var SIZE = req.clean.size || 10;
    var async_query = {};
    
    // admin only
    req.admin = {};
    for (var k in req.clean) { req.admin[k] = req.clean[k]; }
    req.admin.layers = ['admin0','admin1','admin2'];
    
    // build async query
    var add_async_query = function(index, layers, precision, fuzzy) {
      async_query['index_' + index] = function(callback) {
        cmd.body = query( layers, precision, fuzzy );
        suggest.query_backend(cmd, callback);
      };
    };
    
    query_mixer.forEach(function(item, index){
      var layers = item.layers === 'admin' ? req.admin : req.clean;
      if (item.precision && Array.isArray( item.precision ) && item.precision.length ) {
        item.precision.forEach(function(precision) {
          add_async_query(index+'.'+precision, layers, precision, item.fuzzy);
        });
      } else {
        add_async_query(index, layers, undefined, item.fuzzy);
      }
    });
    
    async.parallel(async_query, function(err, results) {
      // results is equal to: {a: docs, b: docs, c: docs}
      var results_keys = Object.keys(async_query);
      var combined = suggest.mix_results(results, results_keys, SIZE);
      suggest.respond(combined);
    });
  
  }

  return controller;
}

module.exports = setup;