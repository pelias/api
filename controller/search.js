
var service = { search: require('../service/search') };
var geojsonify = require('../helper/geojsonify').search;

function setup( backend, query ){

  // allow overriding of dependencies
  backend = backend || require('../src/backend');
  query = query || require('../query/search');

  function controller( req, res, next ){

    // backend command
    var cmd = {
      index: 'pelias',
      searchType: 'dfs_query_then_fetch',
      body: query( req.clean )
    };

    if (req.clean.layers) {
      cmd.type = req.clean.layers;
    }

    // query backend
    service.search( backend, cmd, function( err, docs ){

      // error handler
      if( err ){ return next( err ); }

      // convert docs to geojson
      var geojson = geojsonify( docs, req.clean.details );

      // response envelope
      geojson.date = new Date().getTime();

      // respond
      return res.status(200).json( geojson );
    });

  }

  return controller;
}

module.exports = setup;
