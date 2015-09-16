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

    // ?
    if( req.clean.hasOwnProperty('type') ){
      cmd.type = req.clean.type;
    }

    // query backend
    service.search( backend, cmd, function( err, docs, meta ){

      // error handler
      if( err ){ return next( err ); }

      // set response data
      res.data = docs;
      res.meta = meta;

      next();
    });

  }

  return controller;
}

module.exports = setup;
