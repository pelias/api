
var service = {
  suggest: require('../service/suggest'),
  mget: require('../service/mget')
};
var geojsonify = require('../helper/geojsonify').search;
var async = require('async');

function setup( backend, query ){

  // allow overriding of dependencies
  backend = backend || require('../src/backend');
  query = query || require('../query/suggest');

  function controller( req, res, next ){

    var cmd = {
      index: 'pelias',
      body: query( req.clean )
    };

    var SIZE = req.clean.size || 10;

    var query_backend = function(cmd, callback) {
      // query backend
      service.suggest( backend, cmd, function( err, docs ){
        
        // error handler
        if( err ){ return next( err ); }

        callback(null, docs);
      });
    };

    var dedup = function(combined) {
      var unique_ids = [];
      return combined.filter(function(item, pos) {
        if (unique_ids.indexOf(item.text) == -1) {
          unique_ids.push(item.text);
          return true;  
        }
        return false;
      });
    };

    var reply = function(docs) {
      
      // convert docs to geojson
      var geojson = geojsonify( docs );

      // response envelope
      geojson.date = new Date().getTime();

      // respond
      return res.status(200).json( geojson );
    };

    var respond = function(data) {

      // no documents suggested, return empty array to avoid ActionRequestValidationException
      if( !Array.isArray( data ) || !data.length ){
        return reply([]);
      }

      // map suggester output to mget query
      var query = data.map( function( doc ) {
        var idParts = doc.text.split(':');
        return {
          _index: 'pelias',
          _type: idParts[0],
          _id: idParts[1]
        };
      });

      service.mget( backend, query, function( err, docs ){

        // error handler
        if( err ){ return next( err ); }

        // reply
        return reply( docs );

      });

    };

    if (req.clean.input) {
      var async_query;

      // admin only
      req.admin = {};
      for (k in req.clean) { req.admin[k] = req.clean[k] }
      req.admin.layers = ['admin0','admin1','admin2'];

      if (req.clean.input.length < 4 && isNaN(parseInt(req.clean.input, 10))) {
        async_query = {
          admin_3p: function(callback){
            cmd.body = query( req.admin, 3 );
            query_backend(cmd, callback);
          },
          admin_1p: function(callback){
            cmd.body = query( req.admin, 1 );
            query_backend(cmd, callback);
          },
          all_3p: function(callback) {
            cmd.body = query( req.clean, 3 );
            query_backend(cmd, callback);
          }
        }
      } else {
        async_query = {
          all_5p: function(callback){
            cmd.body = query( req.clean, 5);
            query_backend(cmd, callback);
          },
          all_3p: function(callback){
            cmd.body = query( req.clean, 3);
            query_backend(cmd, callback);
          },
          all_1p: function(callback){
            cmd.body = query( req.clean, 1 );
            query_backend(cmd, callback);
          },
          admin_1p: function(callback){
            cmd.body = query( req.admin );
            query_backend(cmd, callback);
          }
        }
      }
      
      async.parallel(async_query, function(err, results) {
        // results is equal to: {a: docs, b: docs, c: docs}
        var splice_length = parseInt((SIZE / Object.keys(results).length), 10);
        var results_keys = Object.keys(async_query);
        
        var combined = []; 
        results_keys.forEach(function(key){
          combined = combined.concat(results[key].splice(0,splice_length));
        });
        
        combined = dedup(combined);
        respond(combined);
      });
    } else {
      query_backend(cmd, function(err, results) {
        respond(results);
      });
    }
  
  }

  return controller;
}

module.exports = setup;