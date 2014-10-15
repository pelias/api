
var geojsonify = require('../helper/geojsonify').search;

function setup( backend ){

  // allow overriding of dependencies
  backend = backend || require('../src/backend');

  function controller( req, res, next ){
    
    // backend command
    var cmd = {
      index: 'pelias',
      type: req.clean.type,
      id: req.clean.id
    };
    
    // query backend
    backend().client.get( cmd, function( err, data ){

      var docs = [];
      // handle backend errors
      if( err ){ return next( err ); }

      if( data && data.found && data._source ){
        docs.push(data._source);
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
