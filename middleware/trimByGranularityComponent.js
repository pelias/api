const _ = require('lodash');

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
// some places where this list differs in order from trimByGranularity:
// - because house number and street are in a single field, street hits must be considered
//   more important than addresses due to how ES matches
// - country outranks dependency, this was done to ensure that "country=United States" doesn't
//   bump up US dependencies containing "United States" above the country
const layers = [
  'venue',
  'street',
  'address',
  'neighbourhood',
  'borough',
  'locality',
  'localadmin',
  'county',
  'macrocounty',
  'region',
  'macroregion',
  'country',
  'dependency'
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
  return results.some( (result) => {
    return result._matched_queries[0] === 'fallback.' + layer;
  });
}

function retainRecordsAtLayers(results, layer) {
  return results.filter( (result) => {
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
   layers.forEach( (layer) => {
     if (hasRecordsAtLayers(res.data, layer )) {
       res.data = retainRecordsAtLayers(res.data, layer);
     }
   });

   next();
 };
}

module.exports = setup;
