
var service = { suggest: require('../service/suggest') };
var geojsonify = require('../helper/geojsonify').suggest;

function setup( backend, query ){

  // allow overriding of dependencies
  backend = backend || require('../src/backend');
  query = query || require('../query/suggest');

  function controller( req, res, next ){

    // backend command
    var cmd = {
      index: 'pelias',
      body: query( req.clean )
    };

    // query backend
    service.suggest( backend, cmd, function( err, docs ){

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