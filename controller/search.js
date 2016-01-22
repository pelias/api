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
      delete req.clean.type; //to declutter output
      return next();
    }

    // log clean parameters for stats
    logger.info('[req]', 'endpoint=' + req.path, req.clean);

    // backend command
    var cmd = {
      index: 'pelias',
      searchType: 'dfs_query_then_fetch',
      body: query( req.clean )
    };

    // set the Elasticsearch types to filter by,
    // and remove the property from clean so the API
    // response output is cleaner
    if( req.clean.hasOwnProperty('type') ){
      cmd.type = req.clean.type;
      delete req.clean.type;
    }

    logger.debug( '[ES req]', JSON.stringify(cmd) );

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
      logger.debug('[ES response]', JSON.stringify(docs));
      next();
    });

  }

  return controller;
}

module.exports = setup;
