
var geojsonify = require('../helper/geojsonify').search;

function setup( backend, query ){

  // allow overriding of dependencies
  backend = backend || require('../src/backend');
  query = query || require('../query/search');

  function controller( req, res, next ){

    // backend command
    var cmd = {
      index: 'pelias',
      body: query( req.clean )
    };

    if (req.clean.layers) {
      cmd.type = req.clean.layers;
    }
    // query backend
    backend().client.search( cmd, function( err, data ){

      var docs = [];

      // handle backend errors
      if( err ){ return next( err ); }

      if( data && data.hits && data.hits.total && Array.isArray(data.hits.hits)){
        docs = data.hits.hits.map( function( hit ){
          return hit._source;
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
