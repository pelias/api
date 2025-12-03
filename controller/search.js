const _ = require('lodash');
const searchService = require('../service/search');
const logger = require('pelias-logger').get('api');
const logging = require( '../helper/logging' );
const retry = require('retry');
const Debug = require('../helper/debug');
const debugLog = new Debug('controller:search');

function isRequestTimeout(err) {
  return _.get(err, 'status') === 408;
}

function setup( peliasConfig, esclient, query, should_execute ){
  const apiConfig = _.get(peliasConfig, 'api', {});

  function controller( req, res, next ){
    if (!should_execute(req, res)) {
      return next();
    }

    let cleanOutput = _.cloneDeep(req.clean);
    if (logging.isDNT(req)) {
      cleanOutput = logging.removeFields(cleanOutput);
    }

    // rendering a query requires passing the `clean` object, which contains
    // validated options from query parameters, and the `res` object, since
    // some queries use the results of previous queries to Placeholder
    const renderedQuery = query(req.clean, res);

    // if there's no query to call ES with, skip the service
    if (_.isUndefined(renderedQuery)) {
      debugLog.push(req, 'No query to call ES with. Skipping');
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

    // elasticsearch command
    const cmd = {
      index: apiConfig.indexName,
      searchType: 'dfs_query_then_fetch',
      body: renderedQuery.body
    };

    // support for the 'clean.enableElasticExplain' config flag
    if (_.get(req, 'clean.enableElasticExplain') === true) {
      cmd.explain = true;
    }

    if (_.get(apiConfig, 'trackTotalHits') === true) {
      cmd.track_total_hits = true;
    }

    // support for the 'clean.exposeInternalDebugTools' config flag
    let debugUrl;
    if (_.get(req, 'clean.exposeInternalDebugTools') === true) {

      // select a random elasticsearch host to use for 'exposeInternalDebugTools' actions
      const host = _.first(esclient.transport.connectionPool.getConnections(null, 1)).host;

      // generate a URL which opens this query directly in elasticsearch
      debugUrl = host.makeUrl({
        path: `${apiConfig.indexName}/_search`,
        query: {
          source_content_type: 'application/json',
          source: JSON.stringify(cmd.body)
        }
      });
    }

    debugLog.push(req, {
      debugUrl,
      ES_req: cmd
    });

    operation.attempt((currentAttempt) => {
      const start = Date.now();

      // query elasticsearch
      searchService( esclient, cmd, function( err, docs, meta, data ){

        // keep tally of hit counts - compatible with new/old versions of ES
        let totalHits = 0;
        if( _.has(data, 'hits.total') ) {
          totalHits = _.isPlainObject(data.hits.total) ? data.hits.total.value : data.hits.total;
        }

        const message = {
          controller: 'search',
          queryType: renderedQuery.type,
          es_hits: totalHits,
          result_count: (docs || []).length,
          es_took: _.get(data, 'took', undefined),
          response_time: _.get(data, 'response_time', undefined),
          params: req.clean,
          retries: currentAttempt - 1,
          text_length: _.get(req, 'clean.text.length', 0)
        };
        logger.info('elasticsearch', message);

        // returns true if the operation should be attempted again
        // (handles bookkeeping of maxRetries)
        // only consider for status 408 (request timeout)
        if (isRequestTimeout(err) && operation.retry(err)) {
          debugLog.push(req, {
            warning: `request timed out on attempt ${currentAttempt}, retrying`,
            duration: Date.now() - start
          });
          return;
        }

        // if execution has gotten this far then one of three things happened:
        // - the request returned a response, either success or error
        // - maxRetries has been hit so we're giving up
        // - another error occurred
        // in any case, handle the error or results

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
          // because this controller may be called multiple times, there may already
          // be results.  if there are no results from this ES call, don't overwrite
          // what's already there from a previous call.
          if (!_.isEmpty(docs)) {
            res.data = docs;
            res.meta = meta || {};
            // store the query_type for subsequent middleware
            res.meta.query_type = renderedQuery.type;
          }

          // put an entry in the debug log no matter the number of results
          debugLog.push(req, {queryType: {
            [renderedQuery.type] : {
              es_took: message.es_took,
              response_time: message.response_time,
              retries: message.retries,
              es_hits: message.es_hits,
              es_result_count: message.result_count
            }
          }});
        }
        logger.debug('[ES response]', docs);
        if (req.clean.enableElasticDebug) {
          debugLog.push(req, { ES_response: _.cloneDeep({ docs, meta, data }) });
        }
        next();
      });
      debugLog.push(req, {
        duration: Date.now() - start
      });
    });
  }

  return controller;
}

module.exports = setup;
