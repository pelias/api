const _ = require('lodash');
const path = require('path');
const requireAll = require('require-all');
const express = require('express');
const { Router } = express;
const sorting = require('pelias-sorting');
const elasticsearch = require('elasticsearch');
const {all, any, not} = require('predicates');

// imports
const sanitizers = requireAll(path.join(__dirname, '../sanitizer'));
const middleware = requireAll(path.join(__dirname, '../middleware'));
const controllers = requireAll(path.join(__dirname, '../controller'));
const queries = requireAll(path.join(__dirname, '../query'));

// predicates that drive whether controller/search runs
const predicates = requireAll(path.join(__dirname, '../controller/predicates'));
predicates.hasRequestCategories = predicates.hasRequestParameter('categories');

// shorthand for standard early-exit conditions
const hasResponseDataOrRequestErrors = any(predicates.hasResponseData, predicates.hasRequestErrors);
predicates.hasAdminOnlyResults = not(predicates.hasResultsAtLayers(['venue', 'address', 'street']));

const serviceWrapper = require('pelias-microservice-wrapper').service;
const configuration = requireAll(path.join(__dirname, '../service/configurations'));

/**
 * Append routes to app
 *
 * @param {object} app
 * @param {object} peliasConfig
 */
function addRoutes(app, peliasConfig) {
  const esclient = elasticsearch.Client(_.extend({}, peliasConfig.esclient));

  const pipConfiguration = new configuration.PointInPolygon(_.defaultTo(peliasConfig.api.services.pip, {}));
  const pipService = serviceWrapper(pipConfiguration);
  const isPipServiceEnabled = _.constant(pipConfiguration.isEnabled());

  const placeholderConfiguration = new configuration.PlaceHolder(_.defaultTo(peliasConfig.api.services.placeholder, {}));
  const placeholderService = serviceWrapper(placeholderConfiguration);
  const isPlaceholderServiceEnabled = _.constant(placeholderConfiguration.isEnabled());

  const changeLanguageConfiguration = new configuration.Language(_.defaultTo(peliasConfig.api.services.placeholder, {}));
  const changeLanguageService = serviceWrapper(changeLanguageConfiguration);
  const isChangeLanguageEnabled = _.constant(changeLanguageConfiguration.isEnabled());

  const interpolationConfiguration = new configuration.Interpolation(_.defaultTo(peliasConfig.api.services.interpolation, {}));
  const interpolationService = serviceWrapper(interpolationConfiguration);
  const isInterpolationEnabled = _.constant(interpolationConfiguration.isEnabled());

  // standard libpostal should use req.clean.text for the `address` parameter
  const libpostalConfiguration = new configuration.Libpostal(
    _.defaultTo(peliasConfig.api.services.libpostal, {}),
    _.property('clean.text'));
  const libpostalService = serviceWrapper(libpostalConfiguration);

  // structured libpostal should use req.clean.parsed_text.address for the `address` parameter
  const structuredLibpostalConfiguration = new configuration.Libpostal(
    _.defaultTo(peliasConfig.api.services.libpostal, {}),
    _.property('clean.parsed_text.address'));
  const structuredLibpostalService = serviceWrapper(structuredLibpostalConfiguration);

  // fallback to coarse reverse when regular reverse didn't return anything
  const coarseReverseShouldExecute = all(
    isPipServiceEnabled, not(predicates.hasRequestErrors), not(predicates.hasResponseData), not(predicates.isOnlyNonAdminLayers)
  );

  const libpostalShouldExecute = all(
    not(predicates.hasRequestErrors),
    not(predicates.isRequestSourcesOnlyWhosOnFirst)
  );

  // for libpostal to execute for structured requests, req.clean.parsed_text.address must exist
  const structuredLibpostalShouldExecute = all(
    not(predicates.hasRequestErrors),
    predicates.hasParsedTextProperties.all('address')
  );

  // execute placeholder if libpostal only parsed as admin-only and needs to
  //  be geodisambiguated
  const placeholderGeodisambiguationShouldExecute = all(
    not(predicates.hasRequestErrors),
    isPlaceholderServiceEnabled,
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
      predicates.isRequestSourcesOnlyWhosOnFirst,
      all(
        predicates.isAdminOnlyAnalysis,
        any(
          predicates.isRequestSourcesUndefined,
          predicates.isRequestSourcesIncludesWhosOnFirst
        )
      )
    )
  );

  // execute placeholder if libpostal identified address parts but ids need to
  //  be looked up for admin parts
  const placeholderIdsLookupShouldExecute = all(
    not(predicates.hasRequestErrors),
    isPlaceholderServiceEnabled,
    predicates.isRequestLayersAnyAddressRelated,
    // check clean.parsed_text for several conditions that must all be true
    all(
      // run placeholder if clean.parsed_text has 'street'
      predicates.hasParsedTextProperties.any('street'),
      // don't run placeholder if there's a query or category
      not(predicates.hasParsedTextProperties.any('query', 'category')),
      // run placeholder if there are any adminareas identified
      predicates.hasParsedTextProperties.any('neighbourhood', 'borough', 'city', 'county', 'state', 'country')
    )
  );

  const searchWithIdsShouldExecute = all(
    not(predicates.hasRequestErrors),
    // don't search-with-ids if there's a query or category
    not(predicates.hasParsedTextProperties.any('query', 'category')),
    // at least one layer allowed by the query params must be related to addresses
    predicates.isRequestLayersAnyAddressRelated,
    // there must be a street
    predicates.hasParsedTextProperties.any('street')
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
    not(predicates.hasRequestErrors),
    not(predicates.hasResponseData),
    not(placeholderShouldHaveExecuted)
  );

  // defer to pelias parser for analysis IF there's no response AND placeholder should not have executed
  const shouldDeferToPeliasParser = function(req, res) {
    if (not(predicates.hasResponseData)(req, res)) {
      return true;
    }
    const ph = placeholderShouldHaveExecuted(req,res);

    const admin = all(
      not(predicates.isRequestSourcesOnlyWhosOnFirst),
      any(
        all(
          predicates.hasAdminOnlyResults,
          not(predicates.isAdminOnlyAnalysis)
        ),
        not(predicates.hasResponseData)
      )
    )(req, res);

    return ph && admin;
  };

  // call search_pelias_parser query if pelias_parser was the parser
  const searchPeliasParserShouldExecute = all(
    not(predicates.hasRequestErrors),
    predicates.isPeliasParse
  );

  // get language adjustments if:
  // - there's a response
  // - theres's a lang parameter in req.clean
  const changeLanguageShouldExecute = all(
    predicates.hasResponseData,
    not(predicates.hasRequestErrors),
    isChangeLanguageEnabled,
    predicates.hasRequestParameter('lang')
  );

  // interpolate if:
  // - there's a number and street
  // - there are street-layer results (these are results that need to be interpolated)
  const interpolationShouldExecute = all(
    not(predicates.hasRequestErrors),
    isInterpolationEnabled,
    predicates.hasParsedTextProperties.all('housenumber', 'street'),
    predicates.hasResultsAtLayers('street')
  );

  // execute under the following conditions:
  // - there are no errors or data
  // - request is not coarse OR pip service is disabled
  const nonCoarseReverseShouldExecute = all(
    not(hasResponseDataOrRequestErrors),
    any(
      not(predicates.isCoarseReverse),
      not(isPipServiceEnabled)
    )
  );

  // helpers to replace vague booleans
  const geometricFiltersApply = true;

  var base = '/v1/';

  /** ------------------------- routers ------------------------- **/

  var routers = {
    index: createRouter([
      controllers.markdownToHtml(peliasConfig.api, './public/apiDoc.md')
    ]),
    attribution: createRouter([
      controllers.markdownToHtml(peliasConfig.api, './public/attribution.md')
    ]),
    search: createRouter([
      sanitizers.search.middleware(peliasConfig.api),
      middleware.requestLanguage,
      middleware.sizeCalculator(),
      controllers.libpostal(libpostalService, libpostalShouldExecute),
      controllers.placeholder(placeholderService, geometricFiltersApply, placeholderGeodisambiguationShouldExecute),
      controllers.placeholder(placeholderService, geometricFiltersApply, placeholderIdsLookupShouldExecute),
      // try 3 different query types: address search using ids, cascading fallback, pelias parser
      controllers.search(peliasConfig, esclient, queries.address_search_using_ids, searchWithIdsShouldExecute),
      controllers.search(peliasConfig, esclient, queries.search, fallbackQueryShouldExecute),
      sanitizers.defer_to_pelias_parser(peliasConfig.api, shouldDeferToPeliasParser), //run additional sanitizers needed for pelias parser
      controllers.search(peliasConfig, esclient, queries.search_pelias_parser, searchPeliasParserShouldExecute),
      middleware.trimByGranularity(),
      middleware.distance('focus.point.'),
      middleware.confidenceScore(peliasConfig.api),
      middleware.confidenceScoreFallback(),
      middleware.interpolate(interpolationService, interpolationShouldExecute, interpolationConfiguration),
      middleware.sortResponseData(sorting, predicates.hasAdminOnlyResults),
      middleware.dedupe(),
      middleware.accuracy(),
      middleware.localNamingConventions(),
      middleware.renamePlacenames(),
      middleware.parseBBox(),
      middleware.normalizeParentIds(),
      middleware.changeLanguage(changeLanguageService, changeLanguageShouldExecute),
      middleware.assignLabels(),
      middleware.geocodeJSON(peliasConfig.api, base),
      middleware.sendJSON
    ]),
    structured: createRouter([
      sanitizers.structured_geocoding.middleware(peliasConfig.api),
      middleware.requestLanguage,
      middleware.sizeCalculator(),
      controllers.structured_libpostal(structuredLibpostalService, structuredLibpostalShouldExecute),
      controllers.search(peliasConfig, esclient, queries.structured_geocoding, not(hasResponseDataOrRequestErrors)),
      middleware.trimByGranularityStructured(),
      middleware.distance('focus.point.'),
      middleware.confidenceScore(peliasConfig.api),
      middleware.confidenceScoreFallback(),
      middleware.interpolate(interpolationService, interpolationShouldExecute, interpolationConfiguration),
      middleware.dedupe(),
      middleware.accuracy(),
      middleware.localNamingConventions(),
      middleware.renamePlacenames(),
      middleware.parseBBox(),
      middleware.normalizeParentIds(),
      middleware.changeLanguage(changeLanguageService, changeLanguageShouldExecute),
      middleware.assignLabels(),
      middleware.geocodeJSON(peliasConfig.api, base),
      middleware.sendJSON
    ]),
    autocomplete: createRouter([
      sanitizers.autocomplete.middleware(peliasConfig.api),
      middleware.requestLanguage,
      middleware.sizeCalculator(),
      controllers.search(peliasConfig, esclient, queries.autocomplete, not(hasResponseDataOrRequestErrors)),
      middleware.distance('focus.point.'),
      middleware.confidenceScore(peliasConfig.api),
      middleware.dedupe(),
      middleware.accuracy(),
      middleware.localNamingConventions(),
      middleware.renamePlacenames(),
      middleware.parseBBox(),
      middleware.normalizeParentIds(),
      middleware.changeLanguage(changeLanguageService, changeLanguageShouldExecute),
      middleware.assignLabels(),
      middleware.geocodeJSON(peliasConfig.api, base),
      middleware.sendJSON
    ]),
    reverse: createRouter([
      sanitizers.reverse.middleware(peliasConfig.api),
      middleware.requestLanguage,
      middleware.sizeCalculator(2),
      controllers.search(peliasConfig, esclient, queries.reverse, nonCoarseReverseShouldExecute),
      controllers.coarse_reverse(pipService, coarseReverseShouldExecute),
      middleware.distance('point.'),
      // reverse confidence scoring depends on distance from origin
      //  so it must be calculated first
      middleware.confidenceScoreReverse(),
      middleware.dedupe(),
      middleware.accuracy(),
      middleware.localNamingConventions(),
      middleware.renamePlacenames(),
      middleware.parseBBox(),
      middleware.normalizeParentIds(),
      middleware.changeLanguage(changeLanguageService, changeLanguageShouldExecute),
      middleware.assignLabels(),
      middleware.geocodeJSON(peliasConfig.api, base),
      middleware.sendJSON
    ]),
    nearby: createRouter([
      sanitizers.nearby.middleware(peliasConfig.api),
      middleware.requestLanguage,
      middleware.sizeCalculator(),
      controllers.search(peliasConfig, esclient, queries.reverse, not(hasResponseDataOrRequestErrors)),
      middleware.distance('point.'),
      // reverse confidence scoring depends on distance from origin
      //  so it must be calculated first
      middleware.confidenceScoreReverse(),
      middleware.dedupe(),
      middleware.accuracy(),
      middleware.localNamingConventions(),
      middleware.renamePlacenames(),
      middleware.parseBBox(),
      middleware.normalizeParentIds(),
      middleware.changeLanguage(changeLanguageService, changeLanguageShouldExecute),
      middleware.assignLabels(),
      middleware.geocodeJSON(peliasConfig.api, base),
      middleware.sendJSON
    ]),
    place: createRouter([
      sanitizers.place.middleware(peliasConfig.api),
      middleware.requestLanguage,
      controllers.place(peliasConfig.api, esclient),
      middleware.accuracy(),
      middleware.localNamingConventions(),
      middleware.renamePlacenames(),
      middleware.parseBBox(),
      middleware.normalizeParentIds(),
      middleware.changeLanguage(changeLanguageService, changeLanguageShouldExecute),
      middleware.assignLabels(),
      middleware.geocodeJSON(peliasConfig.api, base),
      middleware.sendJSON
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

  if (peliasConfig.api.exposeInternalDebugTools) {
    app.use ( '/frontend',                   express.static('node_modules/pelias-compare/dist-api/'));
  }
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
