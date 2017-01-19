'use strict';

const _ = require('lodash');

const searchService = require('../service/search');
const logger = require('pelias-logger').get('api');
const logging = require( '../helper/logging' );
const retry = require('retry');

function setup( apiConfig, esclient, query ){
  function isRequestTimeout(err) {
    return _.get(err, 'status') === 408;
  }

  function controller( req, res, next ){
    // do not run controller when a request
    // validation error has occurred.
    if (_.get(req, 'errors', []).length > 0) {
      return next();
    }

    // do not run controller if there are already results
    // this was added during libpostal integration.  if the libpostal parse/query
    // doesn't return anything then fallback to old search-engine-y behavior
    if (_.get(res, 'data', []).length > 0) {
      return next();
    }

    var cleanOutput = _.cloneDeep(req.clean);
    if (logging.isDNT(req)) {
      cleanOutput = logging.removeFields(cleanOutput);
    }
    // log clean parameters for stats
    logger.info('[req]', 'endpoint=' + req.path, cleanOutput);

    var renderedQuery = query(req.clean);

    // if there's no query to call ES with, skip the service
    if (_.isUndefined(renderedQuery)) {
      return next();
    }

    logger.debug( '[ES req]', cmd );

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

    // elasticsearch command
    var cmd = {
      index: apiConfig.indexName,
      searchType: 'dfs_query_then_fetch',
      body: renderedQuery.body
    };

    operation.attempt((currentAttempt) => {
      // query elasticsearch
      searchService( esclient, cmd, function( err, docs, meta ){
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
          res.meta = meta || {};
          // store the query_type for subsequent middleware
          res.meta.query_type = renderedQuery.type;

          const messageParts = [
            '[controller:search]',
            `[queryType:${renderedQuery.type}]`,
            `[es_result_count:${_.get(res, 'data', []).length}]`
          ];

          logger.info(messageParts.join(' '));
        }
        logger.debug('[ES response]', docs);
        next();
      });

    });

  }

  return controller;
}

module.exports = setup;
