var service = { search: require('../service/search') };
var logger = require('pelias-logger').get('api:controller:search');

function setup( backend, query ){

  // allow overriding of dependencies
  backend = backend || require('../src/backend');
  query = query || require('../query/search');

  function controller( req, res, next ){

    // do not run controller when a request
    // validation error has occurred.
    if( req.errors && req.errors.length ){
      return next();
    }

    // log clean parameters for stats
    logger.info(req.clean);

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
      if( err ){
        req.errors.push( err );
      }
      // set response data
      else {
        res.data = docs;
        res.meta = meta;
      }

      next();
    });

  }

  return controller;
}

module.exports = setup;
