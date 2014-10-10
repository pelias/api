
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

    async.parallel({
      admin: function(callback){
        cmd.body = query_admin( req.clean );
        query_backend(cmd, callback);
      },
      poi: function(callback){
        cmd.body = query_poi( req.clean );
        query_backend(cmd, callback);
      }
    },
    function(err, results) {
      // results is now equals to: {admin: docs, poi: docs}
      var combined = results.poi.slice(0, 3).concat(results.admin);

      // convert docs to geojson
      var geojson = geojsonify( combined );

      // response envelope
      geojson.date = new Date().getTime();

      // respond
      return res.status(200).json( geojson );
    });

  }

  return controller;
}

module.exports = setup;