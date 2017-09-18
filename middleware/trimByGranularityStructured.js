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
// - retain both borough and locality results if both exist for when city=Manhattan is
//   supplied we want to retain borough=Manhattan and city=Manhattan results
const layers = [
  'venue',
  'address',
  'street',
  'postalcode',
  'neighbourhood',
  ['borough', 'locality'],
  'localadmin',
  'county',
  'macrocounty',
  'region',
  'macroregion',
  'country',
  'dependency'
];

// these layers are strictly used to drive one special case:
//   - when there was a borough explicitly supplied
// for example, if the user passed borough=manhattan and city=new york
// then we want to preserve just boroughs if they're most granular and throw away
// city results.  In the usual case where no borough is passed, the city value
// is looked up as a borough in the off chance that the user passed
// city=Manhattan
const explicit_borough_layers = [
  'venue',
  'address',
  'street',
  'postalcode',
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
    if (_.isArray(layer)) {
      return layer.some( (sublayer) => {
        return result._matched_queries[0] === 'fallback.' + sublayer;
      });
    } else {
      return result._matched_queries[0] === 'fallback.' + layer;
    }

  });
}

function retainRecordsAtLayers(results, layer) {
  return results.filter( (result) => {
    if (_.isArray(layer)) {
      return layer.some( (sublayer) => {
        return result._matched_queries[0] === 'fallback.' + sublayer;
      });
    }
    else {
      return result._matched_queries[0] === 'fallback.' + layer;
    }

  });
}

function getLayers(parsed_text) {
  if (parsed_text && parsed_text.hasOwnProperty('borough')) {
    return explicit_borough_layers;
  }
  return layers;
}

function setup() {
 return function trim(req, res, next) {
   // don't do anything if there are no results or there are non-fallback.* named queries
   // there should never be a mixture of fallback.* and non-fallback.* named queries
   if (_.isUndefined(res.data) || !isFallbackQuery(res.data)) {
     return next();
   }

   const layers = getLayers(req.clean.parsed_text);

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
