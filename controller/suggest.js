
var geojsonify = require('../helper/geojsonify').suggest;

function setup( backend, query ){

  function controller( req, res, next ){

    // combine the 2 queries

    // allow overriding of dependencies
    backend = backend || require('../src/backend');
    var query_admin = require('../query/suggest_admin');
    var query_poi = require('../query/suggest_poi');

    // **query_poi** command
    var cmd = {
      index: 'pelias',
      body: query_poi( req.clean )
    };

    // query backend
    backend().client.suggest( cmd, function( err, data ){

      var docs = [];

      // handle backend errors
      if( err ){ return next( err ); }

      // map response to a valid FeatureCollection
      if( data && Array.isArray( data.pelias ) && data.pelias.length ){
        docs = data['pelias'][0].options || [];
      }

      // **query_admin** command
      var cmd = {
        index: 'pelias',
        body: query_admin( req.clean )
      };

      // query backend
      backend().client.suggest( cmd, function( err, data ){

        var docs2 = [];

        // handle backend errors
        if( err ){ return next( err ); }

        // map response to a valid FeatureCollection
        if( data && Array.isArray( data.pelias ) && data.pelias.length ){
          docs2 = data['pelias'][0].options || [];
        }

        /** --- combine 2 doc sets --- **/
        var combined = docs2.slice(0, 3).concat(docs);

        // convert docs to geojson
        var geojson = geojsonify( combined );

        // response envelope
        geojson.date = new Date().getTime();

        // respond
        return res.status(200).json( geojson );

      });

    });

  }

  return controller;
}

module.exports = setup;