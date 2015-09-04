var service = { search: require('../service/search') };

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

    if (req.clean.type !== undefined) {
      cmd.type = req.clean.type;
      delete req.clean.type; // remove type from clean to avoid clutter
    }

    // query backend
    service.search( backend, cmd, function( err, docs, meta ){

      // error handler
      if( err ){ return next( err ); }

      req.results = {
        data: docs,
        meta: meta
      };

      next();
    });

  }

  return controller;
}

module.exports = setup;
