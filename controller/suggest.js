
var geojsonify = require('../helper/geojsonify').suggest;
var async = require('async');

function setup( backend, query ){

  function controller( req, res, next ){

    // combine the 2 queries

    // allow overriding of dependencies
    backend = backend || require('../src/backend');
    var query_admin = require('../query/suggest_admin');
    var query_poi = require('../query/suggest_poi');
    var cmd = {
      index: 'pelias'
    };
    var query_backend = function(cmd, callback) {
      // query backend
      backend().client.suggest( cmd, function( err, data ){

        var docs = [];

        // handle backend errors
        if( err ){ return next( err ); }

        // map response to a valid FeatureCollection
        if( data && Array.isArray( data.pelias ) && data.pelias.length ){
          docs = data['pelias'][0].options || [];
        }

        callback(null, docs);
      });
    };

    var dedup = function(combined) {
      var unique_ids = [];
      return combined.filter(function(item, pos) {
        if (unique_ids.indexOf(item.payload.id) == -1) {
          unique_ids.push(item.payload.id);
          return true;  
        }
        return false;
      });
    };

    var respond = function(data) {
      // convert docs to geojson
      var geojson = geojsonify( data );

      // response envelope
      geojson.date = new Date().getTime();

      // respond
      return res.status(200).json( geojson );
    };

    var async_query;

    if (req.clean.input.length < 4 && isNaN(parseInt(req.clean.input, 10))) {
      async_query = {
        a: function(callback){
          cmd.body = query_admin( req.clean, 3 );
          query_backend(cmd, callback);
        },
        b: function(callback) {
          cmd.body = query_poi( req.clean );
          query_backend(cmd, callback);
        },
        c: function(callback){
          cmd.body = query_admin( req.clean );
          query_backend(cmd, callback);
        },
      }
    } else {
      async_query = {
        a: function(callback){
          cmd.body = query_poi( req.clean, 5);
          query_backend(cmd, callback);
        },
        b: function(callback){
          cmd.body = query_poi( req.clean, 3);
          query_backend(cmd, callback);
        },
        c: function(callback){
          cmd.body = query_admin( req.clean );
          query_backend(cmd, callback);
        },
        d: function(callback){
          cmd.body = query_poi( req.clean, 1 );
          query_backend(cmd, callback);
        }
      }
    }

    async.parallel(async_query, function(err, results) {
      var splice_length = parseInt((req.clean.size / Object.keys(results).length), 10);
      
      // results is equal to: {a: docs, b: docs, c: docs}
      var combined = []; 
      for (keys in results) {
        combined = combined.concat(results[keys].splice(0,splice_length));
      }
      
      combined = dedup(combined);
      respond(combined);
    });

  }

  return controller;
}

module.exports = setup;