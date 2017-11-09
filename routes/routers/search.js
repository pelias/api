const all = require('predicates').all;
const any = require('predicates').any;
const not = require('predicates').not;

const sanitizers = require('../../sanitizer');
const predicates = require('../../controller/predicates');
const controllers = require('../../controller');
const queries = require('../../query');
const postProc = require('../../middleware');

const utils = require('./utils');

module.exports.create = (peliasConfig, esclient, services) => {

  // helpers to replace vague booleans
  const geometricFiltersApply = true;
  const geometricFiltersDontApply = false;

  return utils.createRouter([
    sanitizers.search.middleware(peliasConfig.api),
    postProc.requestLanguage,
    postProc.calcSize(),
    controllers.libpostal(libpostalShouldExecute()),
    controllers.placeholder(services.placeholder.service, geometricFiltersApply, placeholderGeodisambiguationShouldExecute(services)),
    controllers.placeholder(services.placeholder.service, geometricFiltersDontApply, placeholderIdsLookupShouldExecute(services)),
    controllers.search_with_ids(peliasConfig.api, esclient, queries.address_using_ids, searchWithIdsShouldExecute()),
    controllers.search_with_appending_results(peliasConfig.api, esclient, queries.venues, venuesSearchShouldExecute()),
    // 3rd parameter is which query module to use, use fallback first, then
    //  use original search strategy if first query didn't return anything
    controllers.search(peliasConfig.api, esclient, queries.cascading_fallback, fallbackQueryShouldExecute(services)),
    sanitizers.defer_to_addressit(shouldDeferToAddressIt(services)),
    controllers.search(peliasConfig.api, esclient, queries.very_old_prod, oldProdQueryShouldExecute()),
    postProc.trimByGranularity(),
    postProc.distances('focus.point.'),
    postProc.confidenceScores(peliasConfig.api),
    postProc.confidenceScoresFallback(),
    postProc.interpolate(services.interpolation.service, utils.interpolationShouldExecute(services)),
    postProc.sortResponseData(require('pelias-sorting'), predicates.hasAdminOnlyResults),
    postProc.dedupe(),
    postProc.accuracy(),
    postProc.localNamingConventions(),
    postProc.renamePlacenames(),
    postProc.parseBoundingBox(),
    postProc.normalizeParentIds(),
    postProc.changeLanguage(services.language.service, utils.changeLanguageShouldExecute(services)),
    postProc.assignLabels(),
    postProc.geocodeJSON(peliasConfig.api, utils.base),
    postProc.sendJSON
  ]);
};

// search for venues under the following conditions:
// - there are no request errors
// - analysis is only admin (no address, query, or street)
// - there's a single field in analysis
// - request has a focus.point available
// - TODO: needs check for venues is in layers
// https://github.com/pelias/pelias/issues/564
const venuesSearchShouldExecute = () => {
  return all(
    not(predicates.hasRequestErrors),
    predicates.isVenueLayerRequested,
    predicates.isAdminOnlyAnalysis,
    predicates.isSingleFieldAnalysis,
    predicates.hasRequestFocusPoint
  );
};

const libpostalShouldExecute = () => {
  return all(
    not(predicates.hasRequestErrors),
    not(predicates.isRequestSourcesOnlyWhosOnFirst)
  );
};

const searchWithIdsShouldExecute = () => {
  return all(
    not(predicates.hasRequestErrors),
    // don't search-with-ids if there's a query or category
    not(predicates.hasParsedTextProperties.any('query', 'category')),
    // there must be a street
    predicates.hasParsedTextProperties.any('street')
  );
};


// execute placeholder if libpostal only parsed as admin-only and needs to
//  be geodisambiguated
const placeholderGeodisambiguationShouldExecute = (services) => {
  return all(
    not(predicates.hasResponseDataOrRequestErrors),
    services.placeholder.isEnabled,
    // check request.clean for several conditions first
    not(
      any(
        // layers only contains venue, address, or street
        predicates.isOnlyNonAdminLayers,
        // don't geodisambiguate if categories were requested
        predicates.hasRequestCategories
      )
    ),
    any(
      // only geodisambiguate if libpostal returned only admin areas or libpostal was skipped
      predicates.isAdminOnlyAnalysis,
      predicates.isRequestSourcesOnlyWhosOnFirst
    )
  );
};

// execute placeholder if libpostal identified address parts but ids need to
//  be looked up for admin parts
const placeholderIdsLookupShouldExecute = (services) => {
  return all(
    not(predicates.hasResponseDataOrRequestErrors),
    services.placeholder.isEnabled,
    // check clean.parsed_text for several conditions that must all be true
    all(
      // run placeholder if clean.parsed_text has 'street'
      predicates.hasParsedTextProperties.any('street'),
      // don't run placeholder if there's a query or category
      not(predicates.hasParsedTextProperties.any('query', 'category')),
      // run placeholder if there are any admin areas identified
      predicates.hasParsedTextProperties.any('neighbourhood', 'borough', 'city', 'county', 'state', 'country')
    )
  );
};

// placeholder should have executed, useful for determining whether to actually
//  fallback or not (don't fallback to old search if the placeholder response
//  should be honored as is)
const placeholderShouldHaveExecuted = (services) => {
  return any(
    placeholderGeodisambiguationShouldExecute(services),
    placeholderIdsLookupShouldExecute(services)
  );
};

// don't execute the cascading fallback query IF placeholder should have executed
//  that way, if placeholder didn't return anything, don't try to find more things the old way
const fallbackQueryShouldExecute = (services) => {
  return all(
    not(predicates.hasRequestErrors),
    not(predicates.hasResponseData),
    not(placeholderShouldHaveExecuted(services))
  );
};

// defer to addressit for analysis IF there's no response AND placeholder should not have executed
const shouldDeferToAddressIt = (services) => {
  return all(
    not(predicates.hasRequestErrors),
    not(predicates.hasResponseData),
    not(placeholderShouldHaveExecuted(services))
  );
};

// call very old prod query if addressit was the parser
const oldProdQueryShouldExecute = () => {
  return all(
    not(predicates.hasRequestErrors),
    predicates.isAddressItParse
  );
};