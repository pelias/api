var Router = require('express').Router;
var elasticsearch = require('elasticsearch');

const all = require('predicates').all;
const any = require('predicates').any;
const not = require('predicates').not;
const _ = require('lodash');

/** ----------------------- sanitizers ----------------------- **/
var sanitizers = {
  autocomplete: require('../sanitizer/autocomplete'),
  place: require('../sanitizer/place'),
  search: require('../sanitizer/search'),
  defer_to_addressit: require('../sanitizer/defer_to_addressit'),
  structured_geocoding: require('../sanitizer/structured_geocoding'),
  reverse: require('../sanitizer/reverse'),
  nearby: require('../sanitizer/nearby')
};

/** ----------------------- middleware ------------------------ **/
var middleware = {
  calcSize: require('../middleware/sizeCalculator'),
  requestLanguage: require('../middleware/requestLanguage')
};

/** ----------------------- controllers ----------------------- **/

var controllers = {
  coarse_reverse: require('../controller/coarse_reverse'),
  mdToHTML: require('../controller/markdownToHtml'),
  libpostal: require('../controller/libpostal'),
  place: require('../controller/place'),
  placeholder: require('../controller/placeholder'),
  search: require('../controller/search'),
  search_with_ids: require('../controller/search_with_ids'),
  status: require('../controller/status')
};

var queries = {
  cascading_fallback: require('../query/search'),
  very_old_prod: require('../query/search_original'),
  structured_geocoding: require('../query/structured_geocoding'),
  reverse: require('../query/reverse'),
  autocomplete: require('../query/autocomplete'),
  address_using_ids: require('../query/address_search_using_ids')
};

/** ----------------------- controllers ----------------------- **/

var postProc = {
  trimByGranularity: require('../middleware/trimByGranularity'),
  trimByGranularityStructured: require('../middleware/trimByGranularityStructured'),
  distances: require('../middleware/distance'),
  confidenceScores: require('../middleware/confidenceScore'),
  confidenceScoresFallback: require('../middleware/confidenceScoreFallback'),
  confidenceScoresReverse: require('../middleware/confidenceScoreReverse'),
  accuracy: require('../middleware/accuracy'),
  dedupe: require('../middleware/dedupe'),
  interpolate: require('../middleware/interpolate'),
  localNamingConventions: require('../middleware/localNamingConventions'),
  renamePlacenames: require('../middleware/renamePlacenames'),
  geocodeJSON: require('../middleware/geocodeJSON'),
  sendJSON: require('../middleware/sendJSON'),
  parseBoundingBox: require('../middleware/parseBBox'),
  normalizeParentIds: require('../middleware/normalizeParentIds'),
  assignLabels: require('../middleware/assignLabels'),
  changeLanguage: require('../middleware/changeLanguage'),
  sortResponseData: require('../middleware/sortResponseData')
};

// predicates that drive whether controller/search runs
const hasAnyParsedTextProperty = require('../controller/predicates/has_any_parsed_text_property');
const hasResponseData = require('../controller/predicates/has_response_data');
const hasRequestErrors = require('../controller/predicates/has_request_errors');
const isCoarseReverse = require('../controller/predicates/is_coarse_reverse');
const isAdminOnlyAnalysis = require('../controller/predicates/is_admin_only_analysis');
const hasResultsAtLayers = require('../controller/predicates/has_results_at_layers');
const isSingleFieldAnalysis = require('../controller/predicates/is_single_field_analysis');
const isAddressItParse = require('../controller/predicates/is_addressit_parse');
const hasRequestCategories = require('../controller/predicates/has_request_parameter')('categories');
const isOnlyNonAdminLayers = require('../controller/predicates/is_only_non_admin_layers');
// this can probably be more generalized
const isRequestSourcesOnlyWhosOnFirst = require('../controller/predicates/is_request_sources_only_whosonfirst');

// shorthand for standard early-exit conditions
const hasResponseDataOrRequestErrors = any(hasResponseData, hasRequestErrors);
const hasAdminOnlyResults = not(hasResultsAtLayers(['venue', 'address', 'street']));

const hasNumberButNotStreet = all(
  hasAnyParsedTextProperty('number'),
  not(hasAnyParsedTextProperty('street'))
);

const serviceWrapper = require('pelias-microservice-wrapper').service;
const PlaceHolder = require('../service/configurations/PlaceHolder');
const PointInPolygon = require('../service/configurations/PointInPolygon');

/**
 * Append routes to app
 *
 * @param {object} app
 * @param {object} peliasConfig
 */
function addRoutes(app, peliasConfig) {
  const esclient = elasticsearch.Client(peliasConfig.esclient);

  const pipConfiguration = new PointInPolygon(_.defaultTo(peliasConfig.api.services.pip, {}));
  const pipService = serviceWrapper(pipConfiguration);
  const isPipServiceEnabled = _.constant(pipConfiguration.isEnabled());

  const placeholderConfiguration = new PlaceHolder(_.defaultTo(peliasConfig.api.services.placeholder, {}));
  const placeholderService = serviceWrapper(placeholderConfiguration);
  const isPlaceholderServiceEnabled = _.constant(placeholderConfiguration.isEnabled());

  // fallback to coarse reverse when regular reverse didn't return anything
  const coarseReverseShouldExecute = all(
    isPipServiceEnabled, not(hasRequestErrors), not(hasResponseData)
  );

  const libpostalShouldExecute = all(
    not(hasRequestErrors),
    not(isRequestSourcesOnlyWhosOnFirst)
  );

  // execute placeholder if libpostal only parsed as admin-only and needs to
  //  be geodisambiguated
  const placeholderGeodisambiguationShouldExecute = all(
    not(hasResponseDataOrRequestErrors),
    isPlaceholderServiceEnabled,
    // check request.clean for several conditions first
    not(
      any(
        // layers only contains venue, address, or street
        isOnlyNonAdminLayers,
        // don't geodisambiguate if categories were requested
        hasRequestCategories
      )
    ),
    any(
      // only geodisambiguate if libpostal returned only admin areas or libpostal was skipped
      isAdminOnlyAnalysis,
      isRequestSourcesOnlyWhosOnFirst
    )
  );

  // execute placeholder if libpostal identified address parts but ids need to
  //  be looked up for admin parts
  const placeholderIdsLookupShouldExecute = all(
    not(hasResponseDataOrRequestErrors),
    isPlaceholderServiceEnabled,
    // check clean.parsed_text for several conditions that must all be true
    all(
      // run placeholder if clean.parsed_text has 'street'
      hasAnyParsedTextProperty('street'),
      // don't run placeholder if there's a query or category
      not(hasAnyParsedTextProperty('query', 'category')),
      // run placeholder if there are any adminareas identified
      hasAnyParsedTextProperty('neighbourhood', 'borough', 'city', 'county', 'state', 'country')
    )
  );

  const searchWithIdsShouldExecute = all(
    not(hasRequestErrors),
    // don't search-with-ids if there's a query or category
    not(hasAnyParsedTextProperty('query', 'category')),
    // there must be a street
    hasAnyParsedTextProperty('street')
  );

  // placeholder should have executed, useful for determining whether to actually
  //  fallback or not (don't fallback to old search if the placeholder response
  //  should be honored as is)
  const placeholderShouldHaveExecuted = any(
    placeholderGeodisambiguationShouldExecute,
    placeholderIdsLookupShouldExecute
  );

  // don't execute the cascading fallback query IF placeholder should have executed
  //  that way, if placeholder didn't return anything, don't try to find more things the old way
  const fallbackQueryShouldExecute = all(
    not(hasRequestErrors),
    not(hasResponseData),
    not(placeholderShouldHaveExecuted)
  );

  // defer to addressit for analysis IF there's no response AND placeholder should not have executed
  const shouldDeferToAddressIt = all(
    not(hasRequestErrors),
    not(hasResponseData),
    not(placeholderShouldHaveExecuted)
  );

  // call very old prod query if addressit was the parser
  const oldProdQueryShouldExecute = all(
    not(hasRequestErrors),
    isAddressItParse
  );

  // execute under the following conditions:
  // - there are no errors or data
  // - request is not coarse OR pip service is disabled
  const nonCoarseReverseShouldExecute = all(
    not(hasResponseDataOrRequestErrors),
    any(
      not(isCoarseReverse),
      not(isPipServiceEnabled)
    )
  );

  // helpers to replace vague booleans
  const geometricFiltersApply = true;
  const geometricFiltersDontApply = false;

  var base = '/v1/';

  /** ------------------------- routers ------------------------- **/

  var routers = {
    index: createRouter([
      controllers.mdToHTML(peliasConfig.api, './public/apiDoc.md')
    ]),
    attribution: createRouter([
      controllers.mdToHTML(peliasConfig.api, './public/attribution.md')
    ]),
    search: createRouter([
      sanitizers.search.middleware(peliasConfig.api),
      middleware.requestLanguage,
      middleware.calcSize(),
      controllers.libpostal(libpostalShouldExecute),
      controllers.placeholder(placeholderService, geometricFiltersApply, placeholderGeodisambiguationShouldExecute),
      controllers.placeholder(placeholderService, geometricFiltersDontApply, placeholderIdsLookupShouldExecute),
      controllers.search_with_ids(peliasConfig.api, esclient, queries.address_using_ids, searchWithIdsShouldExecute),
      // 3rd parameter is which query module to use, use fallback first, then
      //  use original search strategy if first query didn't return anything
      controllers.search(peliasConfig.api, esclient, queries.cascading_fallback, fallbackQueryShouldExecute),
      sanitizers.defer_to_addressit(shouldDeferToAddressIt),
      controllers.search(peliasConfig.api, esclient, queries.very_old_prod, oldProdQueryShouldExecute),
      postProc.trimByGranularity(),
      postProc.distances('focus.point.'),
      postProc.confidenceScores(peliasConfig.api),
      postProc.confidenceScoresFallback(),
      postProc.interpolate(),
      postProc.sortResponseData(require('pelias-sorting'), hasAdminOnlyResults),
      postProc.dedupe(),
      postProc.accuracy(),
      postProc.localNamingConventions(),
      postProc.renamePlacenames(),
      postProc.parseBoundingBox(),
      postProc.normalizeParentIds(),
      postProc.changeLanguage(),
      postProc.assignLabels(),
      postProc.geocodeJSON(peliasConfig.api, base),
      postProc.sendJSON
    ]),
    structured: createRouter([
      sanitizers.structured_geocoding.middleware(peliasConfig.api),
      middleware.requestLanguage,
      middleware.calcSize(),
      controllers.search(peliasConfig.api, esclient, queries.structured_geocoding, not(hasResponseDataOrRequestErrors)),
      postProc.trimByGranularityStructured(),
      postProc.distances('focus.point.'),
      postProc.confidenceScores(peliasConfig.api),
      postProc.confidenceScoresFallback(),
      postProc.interpolate(),
      postProc.dedupe(),
      postProc.accuracy(),
      postProc.localNamingConventions(),
      postProc.renamePlacenames(),
      postProc.parseBoundingBox(),
      postProc.normalizeParentIds(),
      postProc.changeLanguage(),
      postProc.assignLabels(),
      postProc.geocodeJSON(peliasConfig.api, base),
      postProc.sendJSON
    ]),
    autocomplete: createRouter([
      sanitizers.autocomplete.middleware(peliasConfig.api),
      middleware.requestLanguage,
      controllers.search(peliasConfig.api, esclient, queries.autocomplete, not(hasResponseDataOrRequestErrors)),
      postProc.distances('focus.point.'),
      postProc.confidenceScores(peliasConfig.api),
      postProc.dedupe(),
      postProc.accuracy(),
      postProc.localNamingConventions(),
      postProc.renamePlacenames(),
      postProc.parseBoundingBox(),
      postProc.normalizeParentIds(),
      postProc.changeLanguage(),
      postProc.assignLabels(),
      postProc.geocodeJSON(peliasConfig.api, base),
      postProc.sendJSON
    ]),
    reverse: createRouter([
      sanitizers.reverse.middleware,
      middleware.requestLanguage,
      middleware.calcSize(),
      controllers.search(peliasConfig.api, esclient, queries.reverse, nonCoarseReverseShouldExecute),
      controllers.coarse_reverse(pipService, coarseReverseShouldExecute),
      postProc.distances('point.'),
      // reverse confidence scoring depends on distance from origin
      //  so it must be calculated first
      postProc.confidenceScoresReverse(),
      postProc.dedupe(),
      postProc.accuracy(),
      postProc.localNamingConventions(),
      postProc.renamePlacenames(),
      postProc.parseBoundingBox(),
      postProc.normalizeParentIds(),
      postProc.changeLanguage(),
      postProc.assignLabels(),
      postProc.geocodeJSON(peliasConfig.api, base),
      postProc.sendJSON
    ]),
    nearby: createRouter([
      sanitizers.nearby.middleware,
      middleware.requestLanguage,
      middleware.calcSize(),
      controllers.search(peliasConfig.api, esclient, queries.reverse, not(hasResponseDataOrRequestErrors)),
      postProc.distances('point.'),
      // reverse confidence scoring depends on distance from origin
      //  so it must be calculated first
      postProc.confidenceScoresReverse(),
      postProc.dedupe(),
      postProc.accuracy(),
      postProc.localNamingConventions(),
      postProc.renamePlacenames(),
      postProc.parseBoundingBox(),
      postProc.normalizeParentIds(),
      postProc.changeLanguage(),
      postProc.assignLabels(),
      postProc.geocodeJSON(peliasConfig.api, base),
      postProc.sendJSON
    ]),
    place: createRouter([
      sanitizers.place.middleware,
      middleware.requestLanguage,
      controllers.place(peliasConfig.api, esclient),
      postProc.accuracy(),
      postProc.localNamingConventions(),
      postProc.renamePlacenames(),
      postProc.parseBoundingBox(),
      postProc.normalizeParentIds(),
      postProc.changeLanguage(),
      postProc.assignLabels(),
      postProc.geocodeJSON(peliasConfig.api, base),
      postProc.sendJSON
    ]),
    status: createRouter([
      controllers.status
    ])
  };


  // static data endpoints
  app.get ( base,                          routers.index );
  app.get ( base + 'attribution',          routers.attribution );
  app.get (        '/attribution',         routers.attribution );
  app.get (        '/status',              routers.status );

  // backend dependent endpoints
  app.get ( base + 'place',                routers.place );
  app.get ( base + 'autocomplete',         routers.autocomplete );
  app.get ( base + 'search',               routers.search );
  app.post( base + 'search',               routers.search );
  app.get ( base + 'search/structured',    routers.structured );
  app.get ( base + 'reverse',              routers.reverse );
  app.get ( base + 'nearby',               routers.nearby );

}

/**
 * Helper function for creating routers
 *
 * @param {[{function}]} functions
 * @returns {express.Router}
 */
function createRouter(functions) {
  var router = Router(); // jshint ignore:line
  functions.forEach(function (f) {
    router.use(f);
  });
  return router;
}


module.exports.addRoutes = addRoutes;
