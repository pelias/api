var service = { mget: require('../service/mget') };
var logger = require('pelias-logger').get('api:controller:place');
var _ = require('lodash');

function setup( backend ){

  // allow overriding of dependencies
  backend = backend || require('../src/backend');

  function controller( req, res, next ){

    // do not run controller when a request
    // validation error has occurred.
    if( !_.isEmpty(req.errors) ){
      return next();
    }

    var query = req.clean[0].ids.map( function(id) {
      return {
        _index: 'pelias',
        _type: id.layers,
        _id: id.id
      };
    });

    logger.debug( '[ES req]', JSON.stringify(query) );

    service.mget( backend, query, function( err, docs ) {
      console.log('err:' + err);

      // error handler
      if( err ){
        req.errors[0] = (req.errors[0] || []).concat( err );
      }
      // set response data
      else {
        res.results = { data: docs };
      }
      logger.debug('[ES response]', JSON.stringify(docs));

      next();
    });
  }

  return controller;
}

module.exports = setup;
