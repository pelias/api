var _ = require('lodash');

var service = { search: require('../service/search') };
var logger = require('pelias-logger').get('api:controller:search');
var logging = require( '../helper/logging' );

function setup( config, backend, query ){

  // allow overriding of dependencies
  backend = backend || require('../src/backend');
  query = query || require('../query/search');

  function controller( req, res, next ){
    // do not run controller when a request
    // validation error has occurred.
    if( req.errors && req.errors.length ){
      return next();
    }

    var cleanOutput = _.cloneDeep(req.clean);
    if (logging.isDNT(req)) {
      cleanOutput = logging.removeFields(cleanOutput);
    }
    // log clean parameters for stats
    logger.info('[req]', 'endpoint=' + req.path, cleanOutput);

    // backend command
    var cmd = {
      index: config.indexName,
      searchType: 'dfs_query_then_fetch',
      body: query( req.clean )
    };

    logger.debug( '[ES req]', cmd );

    // query backend
    service.search( backend, cmd, function( err, docs, meta ){

      // error handler
      if( err ){
        if (_.isObject(err) && err.message) {
          req.errors.push( err.message );
        } else {
          req.errors.push( err );
        }
      }
      // set response data
      else {
        res.data = docs;
        res.meta = meta;
      }
      logger.debug('[ES response]', docs);
      next();
    });

  }

  return controller;
}

module.exports = setup;
