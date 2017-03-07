var _ = require('lodash');

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
var layers = [
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
  return results.every(function(result) {
    return result.hasOwnProperty('_matched_queries') &&
            !_.isEmpty(result._matched_queries) &&
            _.startsWith(result._matched_queries[0], 'fallback.');
  });
}

function hasRecordsAtLayers(results, layer) {
  return results.some(function(result) {
    return result._matched_queries[0] === 'fallback.' + layer;
  });
}

function retainRecordsAtLayers(results, layer) {
  return results.filter(function(result) {
    return result._matched_queries[0] === 'fallback.' + layer;
  });
}

function setup() {
 return function trim(req, res, next) {
   // don't do anything if there are no results or there are non-fallback.* named queries
   // there should never be a mixture of fallback.* and non-fallback.* named queries
   if (_.isUndefined(res.data) || !isFallbackQuery(res.data)) {
     return next();
   }

   // start at the most granular possible layer.  if there are results at a layer
   // then remove everything not at that layer.
   layers.forEach(function(layer) {
     if (hasRecordsAtLayers(res.data, layer )) {
       res.data = retainRecordsAtLayers(res.data, layer);
     }
   });

   next();
 };
}

module.exports = setup;
