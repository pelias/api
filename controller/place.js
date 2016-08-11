var service = { mget: require('../service/mget') };
var logger = require('pelias-logger').get('api:controller:place');

function setup( config, backend ){

  // allow overriding of dependencies
  backend = backend || require('../src/backend');

  function controller( req, res, next ){

    // do not run controller when a request
    // validation error has occurred.
    if( req.errors && req.errors.length ){
      return next();
    }

    var query = req.clean.ids.map( function(id) {
      return {
        _index: config.indexName,
        _type: id.layers,
        _id: id.id
      };
    });

    logger.debug( '[ES req]', query );

    service.mget( backend, query, function( err, docs ) {
      console.log('err:' + err);

      // error handler
      if( err ){
        req.errors.push( err );
      }
      // set response data
      else {
        res.data = docs;
      }
      logger.debug('[ES response]', docs);

      next();
    });
  }

  return controller;
}

module.exports = setup;
