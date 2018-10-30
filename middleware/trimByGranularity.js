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

// build inverted index which maps 'matched_queries' to documents
// eg. { "fallback.street": [ doc1, doc4, doc8 ] }
function buildInvertedIndex(results) {
  let idx = {};
  results.forEach((result, ord) => {
    if( _.isArray( result._matched_queries ) ){
      result._matched_queries.forEach( matchedQuery => {
        if( !_.isArray( idx[matchedQuery] ) ){ idx[matchedQuery] = []; }
        idx[matchedQuery].push( result );
      });
    }
  });
  return idx;
}

// find the most granular possible layer by working through the $layers array in
// order and returning the first one which matches the results.
// note: returns undefined on failure to match any of the layers
function findMostGranularMatchedQuery(idx) {
  for( let i=0; i<layers.length; i++ ){
    let matchedQueryName = 'fallback.' + layers[i];
    if( _.has( idx, matchedQueryName ) ){
      return matchedQueryName;
    }
  }
}

function setup() {
  return function trim(req, res, next) {
    // don't do anything if there are no results or there are non-fallback.* named queries
    // there should never be a mixture of fallback.* and non-fallback.* named queries
    if( !_.isArray(res.data) || !res.data.length || !isFallbackQuery(res.data) ){
      return next();
    }

    // build an index to avoid iterating over the data multiple times
    let idx = buildInvertedIndex(res.data);

    // find the most granular match from the layers list
    let mostGranularMatchedQuery = findMostGranularMatchedQuery(idx);

    // we could not find a 'most granular match', no-op
    if( !mostGranularMatchedQuery ){ return next(); }

    // remove any documents which don't have a matching fallback layer match.
    let filtered = idx[mostGranularMatchedQuery];

    // the filter was applied but the length remained the same, no-op
    if( filtered.length === res.data.length ){ return next(); }

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

    next();
 };
}

module.exports = setup;
