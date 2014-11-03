
var service = { mget: require('../service/mget') };
var geojsonify = require('../helper/geojsonify').search;

function setup( backend ){

  // allow overriding of dependencies
  backend = backend || require('../src/backend');
  
  function controller( req, res, next ){
    
    var query = req.clean.ids.map( function(id) {
      return {
        _index: 'pelias',
        _type: id.type,
        _id: id.id
      };
    });

    service.mget( backend, query, function( err, docs ){

      // error handler
      if( err ){ return next( err ); }

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
