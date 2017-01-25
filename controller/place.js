'use strict';

const _ = require('lodash');
const retry = require('retry');

const mgetService = require('../service/mget');
const logger = require('pelias-logger').get('api');

function requestHasErrors(request) {
  return _.get(request, 'errors', []).length > 0;
}

function isRequestTimeout(err) {
  return _.get(err, 'status') === 408;
}

function setup( apiConfig, esclient ){
  function controller( req, res, next ){
    // do not run controller when a request validation error has occurred.
    if (requestHasErrors(req)){
      return next();
    }

    // options for retry
    // maxRetries is from the API config with default of 3
    // factor of 1 means that each retry attempt will esclient requestTimeout
    const operationOptions = {
      retries: _.get(apiConfig, 'requestRetries', 3),
      factor: 1,
      minTimeout: _.get(esclient, 'transport.requestTimeout')
    };

    // setup a new operation
    const operation = retry.operation(operationOptions);

    const cmd = req.clean.ids.map( function(id) {
      return {
        _index: apiConfig.indexName,
        _type: id.layers,
        _id: id.id
      };
    });

    logger.debug( '[ES req]', cmd );

    operation.attempt((currentAttempt) => {
      mgetService( esclient, cmd, function( err, docs ) {
        // returns true if the operation should be attempted again
        // (handles bookkeeping of maxRetries)
        // only consider for status 408 (request timeout)
        if (isRequestTimeout(err) && operation.retry(err)) {
          logger.info(`request timed out on attempt ${currentAttempt}, retrying`);
          return;
        }

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
          // log that a retry was successful
          // most requests succeed on first attempt so this declutters log files
          if (currentAttempt > 1) {
            logger.info(`succeeded on retry ${currentAttempt-1}`);
          }

          res.data = docs;
        }
        logger.debug('[ES response]', docs);

        next();
      });
    });

  }

  return controller;
}

module.exports = setup;
