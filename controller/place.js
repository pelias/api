var service = { mget: require('../service/mget') };
var logger = require('pelias-logger').get('api');

function setup( apiConfig, esclient ){
  function controller( req, res, next ){

    // do not run controller when a request
    // validation error has occurred.
    if( req.errors && req.errors.length ){
      return next();
    }

    var query = req.clean.ids.map( function(id) {
      return {
        _index: apiConfig.indexName,
        _type: id.layers,
        _id: id.id
      };
    });

    logger.debug( '[ES req]', query );

    service.mget( esclient, query, function( err, docs ) {
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
