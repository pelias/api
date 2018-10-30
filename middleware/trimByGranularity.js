const _ = require('lodash');
const logger = require('pelias-logger').get('api');
const Debug = require('../helper/debug');
const debugLog = new Debug('middleware:trimByGranularity');

// This middleware component trims the results array by granularity when
// FallbackQuery was used.  FallbackQuery is used for inputs like
// `1090 N Charlotte St, Lancaster, PA` where the address may not exist and
// we must fall back to trying `Lancaster, PA`.  If the address does exist then
// FallbackQuery will return results for:
// - address+city+state
// - city+state
// - state
//
// Because the address matched, we're not interested in city+state or state, so
// this component removes results that aren't the most granular.

// layers in increasing order of granularity
const layers = [
  'venue',
  'address',
  'street',
  'neighbourhood',
  'borough',
  'postalcode',
  'locality',
  'localadmin',
  'county',
  'macrocounty',
  'region',
  'macroregion',
  'dependency',
  'country'
];

// this helper method returns `true` if every result has a matched_query
//  starting with `fallback.`
function isFallbackQuery(results) {
  return results.every( result => {
    return result.hasOwnProperty('_matched_queries') &&
            !_.isEmpty(result._matched_queries) &&
            _.startsWith(result._matched_queries[0], 'fallback.');
  });
}

function hasRecordsAtLayers(results, layer) {
  return results.some( result => {
    return result._matched_queries[0] === 'fallback.' + layer;
  });
}

function retainRecordsAtLayers(results, layer) {
  return results.filter( result => {
    return result._matched_queries[0] === 'fallback.' + layer;
  });
}

function setup() {
  return function trim(req, res, next) {
    // don't do anything if there are no results or there are non-fallback.* named queries
    // there should never be a mixture of fallback.* and non-fallback.* named queries
    if( !_.isArray(res.data) || !res.data.length || !isFallbackQuery(res.data) ){
      return next();
    }

    // start at the most granular possible layer.  if there are results at a layer
    // then remove everything not at that layer.
    for( let i=0; i<layers.length; i++ ){
      let layer = layers[i];
      if( hasRecordsAtLayers( res.data, layer ) ){

        // filter records to only contain those from target layer
        let filtered = retainRecordsAtLayers(res.data, layer);

        // the filter was applied but the length remained the same
        if( filtered.length === res.data.length ){ break; }

        // logging / debugging
        let logInfo = {
          unfiltered_length: res.data.length,
          filtered_length: filtered.length,
          unfiltered: res.data.map( hit => hit._matched_queries ),
          filtered: filtered.map( hit => hit._matched_queries )
        };
        logger.debug('[middleware][trimByGranularity]', logInfo);
        debugLog.push(req, logInfo);

        // update data to only contain filtered records
        res.data = filtered;

        // stop iteration upon first successful match
        break;
      }
    }

   next();
 };
}

module.exports = setup;
