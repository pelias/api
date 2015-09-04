
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

    if (req.clean.layers) {
      cmd.type = req.clean.layers;
    }

    // set type if input suggests targeting a layer(s)
    if (req.clean.default_layers_set && req.clean.parsed_input) {
      cmd.type = req.clean.parsed_input.target_layer || cmd.type;
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
