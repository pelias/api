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
  defer_to_pelias_parser: require('../sanitizer/defer_to_pelias_parser'),
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
  structured_libpostal: require('../controller/structured_libpostal'),
  place: require('../controller/place'),
  placeholder: require('../controller/placeholder'),
  search: require('../controller/search'),
  status: require('../controller/status')
};

var queries = {
  cascading_fallback: require('../query/search'),
  search_addressit: require('../query/search_addressit'),
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
const hasResponseData = require('../controller/predicates/has_response_data');
const hasRequestErrors = require('../controller/predicates/has_request_errors');
const isCoarseReverse = require('../controller/predicates/is_coarse_reverse');
const isAdminOnlyAnalysis = require('../controller/predicates/is_admin_only_analysis');
const hasResultsAtLayers = require('../controller/predicates/has_results_at_layers');
const isPeliasParse = require('../controller/predicates/is_pelias_parse');
const hasRequestCategories = require('../controller/predicates/has_request_parameter')('categories');
const isOnlyNonAdminLayers = require('../controller/predicates/is_only_non_admin_layers');
const isRequestLayersAnyAddressRelated = require('../controller/predicates/is_request_layers_any_address_related');
// this can probably be more generalized
const isRequestSourcesOnlyWhosOnFirst = require('../controller/predicates/is_request_sources_only_whosonfirst');
const isRequestSourcesIncludesWhosOnFirst = require('../controller/predicates/is_request_sources_includes_whosonfirst');
const isRequestSourcesUndefined = require('../controller/predicates/is_request_sources_undefined');

const hasRequestParameter = require('../controller/predicates/has_request_parameter');
const hasParsedTextProperties = require('../controller/predicates/has_parsed_text_properties');

// shorthand for standard early-exit conditions
const hasResponseDataOrRequestErrors = any(hasResponseData, hasRequestErrors);
const hasAdminOnlyResults = not(hasResultsAtLayers(['venue', 'address', 'street']));

const hasNumberButNotStreet = all(
  hasParsedTextProperties.any('number'),
  not(hasParsedTextProperties.any('street'))
);

const serviceWrapper = require('pelias-microservice-wrapper').service;
const PlaceHolder = require('../service/configurations/PlaceHolder');
const PointInPolygon = require('../service/configurations/PointInPolygon');
const Language = require('../service/configurations/Language');
const Interpolation = require('../service/configurations/Interpolation');
const Libpostal = require('../service/configurations/Libpostal');

/**
 * Append routes to app
 *
 * @param {object} app
 * @param {object} peliasConfig
 */
function addRoutes(app, peliasConfig) {
  const esclient = elasticsearch.Client(_.extend({}, peliasConfig.esclient));

  const pipConfiguration = new PointInPolygon(_.defaultTo(peliasConfig.api.services.pip, {}));
  const pipService = serviceWrapper(pipConfiguration);
  const isPipServiceEnabled = _.constant(pipConfiguration.isEnabled());

  const placeholderConfiguration = new PlaceHolder(_.defaultTo(peliasConfig.api.services.placeholder, {}));
  const placeholderService = serviceWrapper(placeholderConfiguration);
  const isPlaceholderServiceEnabled = _.constant(placeholderConfiguration.isEnabled());

  const changeLanguageConfiguration = new Language(_.defaultTo(peliasConfig.api.services.placeholder, {}));
  const changeLanguageService = serviceWrapper(changeLanguageConfiguration);
  const isChangeLanguageEnabled = _.constant(changeLanguageConfiguration.isEnabled());

  const interpolationConfiguration = new Interpolation(_.defaultTo(peliasConfig.api.services.interpolation, {}));
  const interpolationService = serviceWrapper(interpolationConfiguration);
  const isInterpolationEnabled = _.constant(interpolationConfiguration.isEnabled());

  // standard libpostal should use req.clean.text for the `address` parameter
  const libpostalConfiguration = new Libpostal(
    _.defaultTo(peliasConfig.api.services.libpostal, {}),
    _.property('clean.text'));
  const libpostalService = serviceWrapper(libpostalConfiguration);

  // structured libpostal should use req.clean.parsed_text.address for the `address` parameter
  const structuredLibpostalConfiguration = new Libpostal(
    _.defaultTo(peliasConfig.api.services.libpostal, {}),
    _.property('clean.parsed_text.address'));
  const structuredLibpostalService = serviceWrapper(structuredLibpostalConfiguration);

  // fallback to coarse reverse when regular reverse didn't return anything
  const coarseReverseShouldExecute = all(
    isPipServiceEnabled, not(hasRequestErrors), not(hasResponseData), not(isOnlyNonAdminLayers)
  );

  const libpostalShouldExecute = all(
    not(hasRequestErrors),
    not(isRequestSourcesOnlyWhosOnFirst)
  );

  // for libpostal to execute for structured requests, req.clean.parsed_text.address must exist
  const structuredLibpostalShouldExecute = all(
    not(hasRequestErrors),
    hasParsedTextProperties.all('address')
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
      isRequestSourcesOnlyWhosOnFirst,
      all(
        isAdminOnlyAnalysis,
        any(
          isRequestSourcesUndefined,
          isRequestSourcesIncludesWhosOnFirst
        )
      )
    )
  );

  // execute placeholder if libpostal identified address parts but ids need to
  //  be looked up for admin parts
  const placeholderIdsLookupShouldExecute = all(
    not(hasResponseDataOrRequestErrors),
    isPlaceholderServiceEnabled,
    isRequestLayersAnyAddressRelated,
    // check clean.parsed_text for several conditions that must all be true
    all(
      // run placeholder if clean.parsed_text has 'street'
      hasParsedTextProperties.any('street'),
      // don't run placeholder if there's a query or category
      not(hasParsedTextProperties.any('query', 'category')),
      // run placeholder if there are any adminareas identified
      hasParsedTextProperties.any('neighbourhood', 'borough', 'city', 'county', 'state', 'country')
    )
  );

  const searchWithIdsShouldExecute = all(
    not(hasRequestErrors),
    // don't search-with-ids if there's a query or category
    not(hasParsedTextProperties.any('query', 'category')),
    // at least one layer allowed by the query params must be related to addresses
    isRequestLayersAnyAddressRelated,
    // there must be a street
    hasParsedTextProperties.any('street')
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

  // defer to pelias parser for analysis IF there's no response AND placeholder should not have executed
  const shouldDeferToPeliasParser = all(
    not(hasRequestErrors),
    not(hasResponseData)
  );

  // call search addressit query if addressit was the parser
  const searchAddressitShouldExecute = all(
    not(hasRequestErrors),
    isPeliasParse
  );

  // get language adjustments if:
  // - there's a response
  // - theres's a lang parameter in req.clean
  const changeLanguageShouldExecute = all(
    hasResponseData,
    not(hasRequestErrors),
    isChangeLanguageEnabled,
    hasRequestParameter('lang')
  );

  // interpolate if:
  // - there's a number and street
  // - there are street-layer results (these are results that need to be interpolated)
  const interpolationShouldExecute = all(
    not(hasRequestErrors),
    isInterpolationEnabled,
    hasParsedTextProperties.all('number', 'street'),
    hasResultsAtLayers('street')
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
      controllers.libpostal(libpostalService, libpostalShouldExecute),
      controllers.placeholder(placeholderService, geometricFiltersApply, placeholderGeodisambiguationShouldExecute),
      controllers.placeholder(placeholderService, geometricFiltersApply, placeholderIdsLookupShouldExecute),
      // try 3 different query types: address search using ids, cascading fallback, addressit
      controllers.search(peliasConfig.api, esclient, queries.address_using_ids, searchWithIdsShouldExecute),
      controllers.search(peliasConfig.api, esclient, queries.cascading_fallback, fallbackQueryShouldExecute),
      sanitizers.defer_to_pelias_parser(shouldDeferToPeliasParser), //run additional sanitizers needed for pelias parser
      controllers.search(peliasConfig.api, esclient, queries.search_addressit, searchAddressitShouldExecute),
      postProc.trimByGranularity(),
      postProc.distances('focus.point.'),
      postProc.confidenceScores(peliasConfig.api),
      postProc.confidenceScoresFallback(),
      postProc.interpolate(interpolationService, interpolationShouldExecute),
      postProc.sortResponseData(require('pelias-sorting'), hasAdminOnlyResults),
      postProc.dedupe(),
      postProc.accuracy(),
      postProc.localNamingConventions(),
      postProc.renamePlacenames(),
      postProc.parseBoundingBox(),
      postProc.normalizeParentIds(),
      postProc.changeLanguage(changeLanguageService, changeLanguageShouldExecute),
      postProc.assignLabels(),
      postProc.geocodeJSON(peliasConfig.api, base),
      postProc.sendJSON
    ]),
    structured: createRouter([
      sanitizers.structured_geocoding.middleware(peliasConfig.api),
      middleware.requestLanguage,
      middleware.calcSize(),
      controllers.structured_libpostal(structuredLibpostalService, structuredLibpostalShouldExecute),
      controllers.search(peliasConfig.api, esclient, queries.structured_geocoding, not(hasResponseDataOrRequestErrors)),
      postProc.trimByGranularityStructured(),
      postProc.distances('focus.point.'),
      postProc.confidenceScores(peliasConfig.api),
      postProc.confidenceScoresFallback(),
      postProc.interpolate(interpolationService, interpolationShouldExecute),
      postProc.dedupe(),
      postProc.accuracy(),
      postProc.localNamingConventions(),
      postProc.renamePlacenames(),
      postProc.parseBoundingBox(),
      postProc.normalizeParentIds(),
      postProc.changeLanguage(changeLanguageService, changeLanguageShouldExecute),
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
      postProc.changeLanguage(changeLanguageService, changeLanguageShouldExecute),
      postProc.assignLabels(),
      postProc.geocodeJSON(peliasConfig.api, base),
      postProc.sendJSON
    ]),
    reverse: createRouter([
      sanitizers.reverse.middleware,
      middleware.requestLanguage,
      middleware.calcSize(2),
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
      postProc.changeLanguage(changeLanguageService, changeLanguageShouldExecute),
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
      postProc.changeLanguage(changeLanguageService, changeLanguageShouldExecute),
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
      postProc.changeLanguage(changeLanguageService, changeLanguageShouldExecute),
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
