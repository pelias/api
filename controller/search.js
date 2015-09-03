var service = { search: require('../service/search') };
var types = require ( '../helper/types' );

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

    // don't directly set cmd.type from types helper to avoid sometimes
    // setting cmd.type to undefined (having the key not set is cleaner)
    var type = types(req.clean.types);
    if (type !== undefined) {
      cmd.type = type;
    }

    // query backend
    service.search( backend, cmd, function( err, docs ){

      // error handler
      if( err ){ return next( err ); }

      req.results = {
        data: docs
      };

      next();
    });

  }

  return controller;
}

module.exports = setup;
