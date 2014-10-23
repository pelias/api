
var geojsonify = require('../helper/geojsonify').search;

function setup( backend ){

  // allow overriding of dependencies
  backend = backend || require('../src/backend');
  backend = new backend(); 
  
  function controller( req, res, next ){
    
    var docs = req.clean.ids.map( function(id) {
      return {
        _index: 'pelias',
        _type: id.type,
        _id: id.id
      };
    });

    // backend command
    var cmd = {
      body: {
        docs: docs
      }
    };
    
    // query new backend
    backend.client.mget( cmd, function( err, data ){
      
      var docs = [];
      // handle backend errors
      if( err ){ return next( err ); }

      if( data && data.docs && Array.isArray(data.docs) && data.docs.length ){
        docs = data.docs.map( function( doc ){
          return doc._source;
        });
      }

      // convert docs to geojson
      var geojson = geojsonify( docs );

      // response envelope
      geojson.date = new Date().getTime();

      // respond
      return res.status(200).json( geojson );
    });

  }

  return controller;
}

module.exports = setup;
