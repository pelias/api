'use strict';

const _ = require('lodash');

const searchService = require('../service/search');
const logger = require('pelias-logger').get('api');
const logging = require( '../helper/logging' );
const retry = require('retry');
const Debug = require('../helper/debug');

function isRequestTimeout(err) {
  return _.get(err, 'status') === 408;
}
function filterByCategories(req, renderedQuery) {
    if (!req || !req.query) {
        return;
    }
    if (!renderedQuery || !renderedQuery.body || !renderedQuery.body.query || !renderedQuery.body.query.bool) {
        return;
    }
    var categories = req.query.categories;
    if (categories) {
        if (!renderedQuery.body.query.bool.must) {
            renderedQuery.body.query.bool.must = [];
        }

        var categoriesTerms = {
            terms: {
                'category': categories.split(',')
            }
        };
        renderedQuery.body.query.bool.must.push(categoriesTerms);


    }
}
function filterByParentIds(req, renderedQuery) {
    if (!req || !req.query) {
        return;
    }
    if (!renderedQuery || !renderedQuery.body || !renderedQuery.body.query || !renderedQuery.body.query.bool) {
        return;
    }
    var countyIds = req.query['boundary.county_ids'];
    var localityIds = req.query['boundary.locality_ids'];
    if (countyIds || localityIds) {
        if (!renderedQuery.body.query.bool.must) {
            renderedQuery.body.query.bool.must = [];
        }

        if (countyIds) {
            var countyTerms = {
                terms: {
                    'parent.county_id': countyIds.split(',')
                }
            };
            renderedQuery.body.query.bool.must.push(countyTerms);
        }

        if (localityIds) {
            var localityTerms = {
                terms: {
                    'parent.locality_id': localityIds.split(',')
                }
            };
            renderedQuery.body.query.bool.must.push(localityTerms);
        }
    }
}
function filterByTariffZones(req, renderedQuery) {
    if (!req || !req.query) {
        return;
    }
    if (!renderedQuery || !renderedQuery.body || !renderedQuery.body.query || !renderedQuery.body.query.bool) {
        return;
    }
    var tariffZoneIds = req.query.tariff_zone_ids;
    var tariffZoneAuthorities = req.query.tariff_zone_authorities;
    if (tariffZoneIds || tariffZoneAuthorities) {
        if (!renderedQuery.body.query.bool.must) {
            renderedQuery.body.query.bool.must = [];
        }

        if (tariffZoneIds) {
            var tariffZoneIdsTerms = {
                terms: {
                    'tariff_zones': tariffZoneIds.split(',')
                }
            };
            renderedQuery.body.query.bool.must.push(tariffZoneIdsTerms);
        }

        if (tariffZoneAuthorities) {
            var tariffZoneAuthoritiesTerms = {
                terms: {
                    'tariff_zone_authorities': tariffZoneAuthorities.split(',')
                }
            };
            renderedQuery.body.query.bool.must.push(tariffZoneAuthoritiesTerms);
        }
    }
}
function setup( apiConfig, esclient, query, should_execute ){
  function controller( req, res, next ){
    if (!should_execute(req, res)) {
      return next();
    }

    const debugLog = new Debug('controller:search');

    let cleanOutput = _.cloneDeep(req.clean);
    if (logging.isDNT(req)) {
      cleanOutput = logging.removeFields(cleanOutput);
    }
    // log clean parameters for stats
    logger.info('[req]', 'endpoint=' + req.path, cleanOutput);

    // ENTUR: logger.info(JSON.stringify(cmd.body)); // Useful debug logging of elasticsearch query

    const renderedQuery = query(req.clean);

    // ENTUR: Filter results based on county / locality in input params
     filterByParentIds(req, renderedQuery);

     // ENTUR: Filter results based on tariff zones in input params
     filterByTariffZones(req, renderedQuery);

      // ENTUR: Filter results based on tariff zones in input params
      filterByCategories(req, renderedQuery);

     //  ENTUR: Be sure to fetch more results than user has requested to allow for deduping.
      // TODO dirty, move to autocomplete specific context
     if (req.path && req.path.includes('autocomplete')) {
          renderedQuery.body.size = req.clean.querySize;
     }

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

    logger.debug( '[ES req]', cmd );
    debugLog.push(req, {ES_req: cmd});

    operation.attempt((currentAttempt) => {
      const initialTime = debugLog.beginTimer(req, `Attempt ${currentAttempt}`);
      // query elasticsearch
      searchService( esclient, cmd, function( err, docs, meta ){
        // returns true if the operation should be attempted again
        // (handles bookkeeping of maxRetries)
        // only consider for status 408 (request timeout)
        if (isRequestTimeout(err) && operation.retry(err)) {
          logger.info(`request timed out on attempt ${currentAttempt}, retrying`);
          debugLog.stopTimer(req, initialTime, 'request timed out, retrying');
          return;
        }

        // if execution has gotten this far then one of three things happened:
        // - the request didn't time out
        // - maxRetries has been hit so we're giving up
        // - another error occurred
        // in either case, handle the error or results

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
          debugLog.push(req, {queryType: {
            [renderedQuery.type] : {
              es_result_count: parseInt(messageParts[2].slice(17, -1))
            }
          }});
        }
        logger.debug('[ES response]', docs);
        next();
      });
      debugLog.stopTimer(req, initialTime);
    });

  }

  return controller;
}

module.exports = setup;
