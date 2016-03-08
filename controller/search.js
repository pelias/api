var service = {
  search: require('../service/search'),
  msearch: require('../service/msearch')
};
var logger = require('pelias-logger').get('api:controller:search');
var _ = require('lodash');

function setup( backend, query ){

  // allow overriding of dependencies
  backend = backend || require('../src/backend');
  query = query || require('../query/search');

  function searchOptions(clean) {
    var cmd = {
      index: 'pelias',
      searchType: 'dfs_query_then_fetch',
    };

    // use layers field for filtering by type
    if( clean.hasOwnProperty('layers') ){
      cmd.type = clean.layers;
    }

    return cmd;
  }

  function controller( req, res, next ){
    // do not run controller when a request
    // validation error has occurred.
    if( !_.isEmpty(req.errors) ){
      return next();
    }

    // log clean parameters for stats
    logger.info('[req]', 'endpoint=' + req.path, req.clean);

    if(Array.isArray(req.clean)) {
      var commands = [];

      req.clean.forEach(function(c) {
        commands.push( searchOptions( c ) );

        var cmd = query( c );
        logger.debug( '[ES req]', JSON.stringify(cmd) );
        commands.push( cmd );
      });

      service.msearch( backend, { body: commands }, function( err, results ) {
        if(err) {
          logger.debug(err);
          req.errors[0] = (req.errors[0] || []).concat( err );
          return next();
        }

        res.results = results;
        results.forEach(function(r, index) {
          if(r.error) {
            req.errors[index] = (req.errors[index] || []).concat(r.error);
          }
        });

        logger.debug('[ES response]', JSON.stringify(results));
        next();
      });
    } else {

      // backend command
      var cmd = searchOptions( req.clean );
      cmd.body = query( req.clean );

      logger.debug( '[ES req]', JSON.stringify(cmd) );

      // query backend
      service.search( backend, cmd, function( err, docs, meta ){

        // error handler
        if( err ){
          req.errors[0] = (req.errors[0] || []).concat( err );
        }
        // set response data
        else {
          res.results = {
            data: docs,
            meta: meta
          };
        }
        logger.debug('[ES response]', JSON.stringify(docs));
        next();
      });
    }
  }

  return controller;
}

module.exports = setup;
