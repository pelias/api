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
  structured_libpostal: require('../controller/structured_libpostal'),
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
const hasResponseData = require('../controller/predicates/has_response_data');
const hasRequestErrors = require('../controller/predicates/has_request_errors');
const isCoarseReverse = require('../controller/predicates/is_coarse_reverse');
const isAdminOnlyAnalysis = require('../controller/predicates/is_admin_only_analysis');
const hasResultsAtLayers = require('../controller/predicates/has_results_at_layers');
const isAddressItParse = require('../controller/predicates/is_addressit_parse');
const hasRequestCategories = require('../controller/predicates/has_request_parameter')('categories');
const isOnlyNonAdminLayers = require('../controller/predicates/is_only_non_admin_layers');
// this can probably be more generalized
const isRequestSourcesOnlyWhosOnFirst = require('../controller/predicates/is_request_sources_only_whosonfirst');
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
  const esclient = elasticsearch.Client(peliasConfig.esclient);

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
      controllers.libpostal(libpostalService, libpostalShouldExecute),
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


//Models
/**
   * @swagger
   * definitions:
   *   standardPeliasReturn:
   *     properties:
   *       geocoding:
   *         type: object
   *         $ref: '#/definitions/geocodingObject'
   *       type:
   *         type: string
   *       features:
   *         type: array
   *         items:
   *           $ref: '#/definitions/featureObject'
   *       bbox:
   *         type: array
   *         items: number
   *   standardPeliasErrorReturn:
   *     properties:
   *       geocoding:
   *         type: object
   *         $ref: '#/definitions/geocodingErrorObject'
   *       type:
   *         type: string
   *       features:
   *         type: array
   *         items:
   *           $ref: '#/definitions/featureObject'
   *       bbox:
   *         type: array
   *         items: number
   *   geocodingObject:
   *     properties:
   *       version:
   *         type: string
   *       attribution:
   *         type: string
   *       query:
   *         type: object
   *       engine:
   *         type: object
   *       timestamp:
   *         type: string
   *   geocodingErrorObject:
   *     properties:
   *       version:
   *         type: string
   *       attribution:
   *         type: string
   *       query:
   *         type: object
   *       errors:
   *         type: array
   *         items: string
   *       timestamp:
   *         type: string
   *   featureObject:
   *     properties:
   *       type:
   *         type: string
   *       geometry:
   *         type: object
   *       properties:
   *         type: object
   *       bbox:
   *         type: array
   *         items: number
*/

  /**
   * @swagger
   * /v1:
   *   get:
   *     tags: 
   *       - v1
   *     operationId: v1
   *     produces:
   *       - application/json
   *     summary: Landing page
   *     responses:
   *       200:
   *         description: 200 ok
   *         examples: 
   *           application/json: { "markdown": "# Pelias API\n### Version: [1.0](https://github.com/venicegeo/pelias-api/releases)\n### 
   * [View our documentation on GitHub](https://github.com/venicegeo/pelias-documentation/blob/master/README.md)\n", "html": "<style>ht
   * ml{font-family:monospace}</style><h1>Pelias API</h1>\n\n<h3>Version: <a href=\"https://github.com/venicegeo/pelias-api/releases\">
   * 1.0</a></h3>\n\n<h3><a href=\"https://github.com/venicegeo/pelias-documentation/blob/master/README.md\">View our documentation 
   * on GitHub</a></h3>" }
   */
  app.get ( base, routers.index );
  /**
   * @swagger
   * /v1/attribution:
   *   get:
   *     tags: 
   *       - v1
   *     operationId: attribution
   *     produces:
   *       - application/json
   *     summary: landing page w/attribution
   *     responses:
   *       200:
   *         description: 200 ok
   *         examples: 
   *           application/json: {
   * "markdown": "# Pelias API\n### Version: [1.0](https://github.com/venicegeo/pelias-api/releases)\n
   * ### [View our documentation on GitHub](https://github.com/venicegeo/pelias-documentation/blob/master/README.md)\n
   * ## Attribution\n* Geocoding by [Pelias](https://pelias.io).\n* Data from\n   * [OpenStreetMap](http://www.openstreetmap.org/copyright)
   * © OpenStreetMap contributors under [ODbL](http://opendatacommons.org/licenses/odbl/). Also see the [OSM Geocoding Guidelines]
   * (https://wiki.osmfoundation.org/wiki/Licence/Community_Guidelines/Geocoding_-_Guideline) for acceptable use.\n   
   * * [OpenAddresses](http://openaddresses.io) under [various public-domain and share-alike licenses](http://results.openaddresses.io/)\n 
   * * [GeoNames](http://www.geonames.org/) under [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/)\n   * [WhosOnFirst]
   * (https://www.whosonfirst.org/) under [various CC-BY or CC-0 equivalent licenses](https://whosonfirst.org/docs/licenses/)",
   * "html": "<style>html{font-family:monospace}</style><h1>Pelias API</h1>\n\n<h3>Version: 
   * <a href=\"https://github.com/venicegeo/pelias-api/releases\">1.0</a></h3>\n\n<h3>
   * <a href=\"https://github.com/venicegeo/pelias-documentation/blob/master/README.md\">View our documentation on GitHub</a></h3>\n\n
   * <h2>Attribution</h2>\n\n<ul><li>Geocoding by <a href=\"https://pelias.io\">Pelias</a>.</li><li>Data from<ul><li>
   * <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> © OpenStreetMap contributors under 
   * <a href=\"http://opendatacommons.org/licenses/odbl/\">ODbL</a>. Also see the <a href=\"https://wiki.osmfoundation.org/wiki/
   * Licence/Community_Guidelines/Geocoding_-_Guideline\">OSM Geocoding Guidelines</a> for acceptable use.</li><li>
   * <a href=\"http://openaddresses.io\">OpenAddresses</a> under <a href=\"http://results.openaddresses.io/\">various 
   * public-domain and share-alike licenses</a></li><li><a href=\"http://www.geonames.org/\">GeoNames</a> under 
   * <a href=\"https://creativecommons.org/licenses/by/4.0/\">CC-BY-4.0</a></li><li><a href=\"https://www.whosonfirst.org/\">
   * WhosOnFirst</a> under <a href=\"https://whosonfirst.org/docs/licenses/\">various CC-BY or CC-0 equivalent licenses</a>
   * </li></ul></li></ul>"
}
   */
  app.get ( base + 'attribution', routers.attribution );
  app.get ( '/attribution', routers.attribution );
  /**
   * @swagger
   * /status:
   *   get:
   *     tags: 
   *       - base
   *     operationId: attribution
   *     produces:
   *       - text/plain
   *     summary: Landing page w/attribution
   *     responses:
   *       200:
   *         description: 200 ok
   *         examples: 
   *           text/plain: "status: ok"
   */
  app.get ( '/status', routers.status );

  // backend dependent endpoints


  /**
   * @swagger
   * /v1/place:
   *   get:
   *     tags: 
   *       - v1
   *     operationId: place
   *     produces:
   *       - application/json
   *     summary: For querying specific place ID(s)
   *     parameters:
   *       - name: ids
   *         description: for details on a place returned from a previous query
   *         in: query
   *         required: true
   *         type: array
   *         items: {"type":"string", "pattern":"^[A-z]*.:[A-z]*.:[0-9]*$"}
   * 
   *     responses:
   *       200:
   *         description: 200 ok
   *         schema:
   *           type: object
   *           $ref: '#/definitions/standardPeliasReturn'
   *       400:
   *         description: 400 bad request
   *         schema:
   *           type: object
   *           $ref: '#/definitions/standardPeliasErrorReturn'
   */
  app.get ( base + 'place', routers.place );
  /**
   * @swagger
   * /v1/autocomplete:
   *   get:
   *     tags: 
   *       - v1
   *     operationId: autocomplete
   *     summary: to give real-time result suggestions without having to type the whole location
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: text
   *         description: Text query
   *         in: query
   *         required: true
   *         type: string
   *       - name: focus.point.lat
   *         description: Focus point latitude
   *         in: query
   *         type: number
   *       - name: focus.point.lon
   *         description: Focus point longitude
   *         in: query
   *         type: number
   *       - name: boundary.rect.min_lon
   *         description: Bounding box minimum longitude
   *         in: query
   *         type: number
   *       - name: boundary.rect.max_lon
   *         description: Bounding box maximum longitude
   *         in: query
   *         type: number
   *       - name: boundary.rect.min_lat
   *         description: Bounding box minimum latitude
   *         in: query
   *         type: number
   *       - name: boundary.rect.max_lat
   *         description: Bounding box maximum latitude
   *         in: query
   *         type: number
   *       - name: sources
   *         description: Sources
   *         in: query
   *         type: string
   *         enum: [openstreetmap, openaddresses, whosonfirst, geonames]
   *       - name: layers
   *         description: Layers
   *         in: query
   *         type: string
   *         enum: [venue, address, street, country, macroregion, region, macrocounty, county, locality, localadmin, borough, 
   *           neighbourhood, coarse]
   *       - name: boundary.county
   *         description: Country boundary
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: 200 ok
   *         schema:
   *           type: object
   *           $ref: '#/definitions/standardPeliasReturn'
   *       400:
   *         description: 400 bad request
   *         schema:
   *           type: object
   *           $ref: '#/definitions/standardPeliasErrorReturn'
   */
  app.get ( base + 'autocomplete', routers.autocomplete );
  /**
   * @swagger
   * /v1/search:
   *   get:
   *     tags: 
   *       - v1
   *     operationId: search
   *     summary: to find a place by searching for an address or name
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: text
   *         description: Text query
   *         in: query
   *         required: true
   *         type: string
   *       - name: size
   *         description: used to limit the number of results returned.
   *         in: query
   *         type: number
   *     responses:
   *       200:
   *         description: 200 ok
   *         schema:
   *           type: object
   *           $ref: '#/definitions/standardPeliasReturn'
   *       400:
   *         description: 400 bad request
   *         schema:
   *           type: object
   *           $ref: '#/definitions/standardPeliasErrorReturn'
   *   post:
   *     tags: 
   *       - v1
   *     operationId: search
   *     summary: to find a place by searching for an address or name
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: text
   *         description: Text query
   *         in: query
   *         required: true
   *         type: string
   *       - name: size
   *         description: used to limit the number of results returned.
   *         in: query
   *         type: number
   *     responses:
   *       200:
   *         description: 200 ok
   *         schema:
   *           type: object
   *           $ref: '#/definitions/standardPeliasReturn'
   *       400:
   *         description: 400 bad request
   *         schema:
   *           type: object
   *           $ref: '#/definitions/standardPeliasErrorReturn'
   */

  app.get ( base + 'search', routers.search );
  app.post( base + 'search', routers.search );
  /**
   * @swagger
   * /v1/search/structured:
   *   get:
   *     tags: 
   *       - v1
   *     operationId: structured
   *     summary: to find a place with data already separated into housenumber, street, city, etc.
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: text
   *         description: Text query
   *         in: query
   *         required: true
   *         type: string
   *       - name: venue
   *         description: WOF Venue
   *         in: query
   *         type: string
   *       - name: address
   *         description: can contain a full address with house number or only a street name.
   *         in: query
   *         type: string
   *       - name: neighbourhood
   *         description: vernacular geographic entities that may not necessarily be official administrative divisions but are important 
   *           nonetheless.
   *         in: query
   *         type: string
   *       - name: borough
   *         description: mostly known in the context of New York City, even though they may exist in other cities, such as Mexico City.
   *         in: query
   *         type: string
   *       - name: locality
   *         description: equivalent to what are commonly referred to as cities.
   *         in: query
   *         type: string
   *       - name: county
   *         description: administrative divisions between localities and regions.
   *         in: query
   *         type: string
   *       - name: region
   *         description: the first-level administrative divisions within countries, analogous to states and provinces in the United States
   *           and Canada, respectively, though most other countries contain regions as well
   *         in: query
   *         type: string
   *       - name: postalcode
   *         description: used to aid in sorting mail with the format dictated by an administrative division
   *         in: query
   *         type: string
   *       - name: country
   *         description: highest-level administrative divisions supported in a search. In addition to full names, countries have common 
   *           two- and three-letter abbreviations that are also supported values for the country parameter.
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: 200 ok
   *         schema:
   *           type: object
   *           $ref: '#/definitions/standardPeliasReturn'
   *       400:
   *         description: 400 bad request
   *         schema:
   *           type: object
   *           $ref: '#/definitions/standardPeliasErrorReturn'
   */
  app.get ( base + 'search/structured', routers.structured );
  /**
   * @swagger
   * /v1/reverse:
   *   get:
   *     tags: 
   *       - v1
   *     operationId: reverse
   *     summary: to find what is located at a certain coordinate location
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: point.lat
   *         description: Latitude (decimal degrees)
   *         in: query
   *         required: true
   *         type: string
   *       - name: point.lon
   *         description: Longitude (decimal degrees)
   *         in: query
   *         required: true
   *         type: string
   *       - name: boundary.circle.radius
   *         description: Bounding circle radius
   *         in: query
   *         type: number
   *       - name: size
   *         description: used to limit the number of results returned.
   *         in: query
   *         type: number
   *       - name: sources
   *         description: one or more valid source names
   *         in: query
   *         type: string
   *         enum: [openstreetmap, openaddresses, whosonfirst, geonames]
   *       - name: layers
   *         description: Layers
   *         in: query
   *         type: string
   *         enum: [venue, address, street, country, macroregion, region, macrocounty, county, locality, localadmin, borough, 
   *           neighbourhood, coarse]
   *       - name: boundary.county
   *         description: Country boundary
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: 200 ok
   *         schema:
   *           type: object
   *           $ref: '#/definitions/standardPeliasReturn'
   *       400:
   *         description: 400 bad request
   *         schema:
   *           type: object
   *           $ref: '#/definitions/standardPeliasErrorReturn'
   */
  app.get ( base + 'reverse', routers.reverse );
  /**
   * @swagger
   * /v1/nearby:
   *   get:
   *     tags: 
   *       - v1 
   *     operationId: nearby
   *     summary: reverse geocode search including surrounding areas
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: point.lat
   *         description: Latitude (decimal degrees)
   *         in: query
   *         required: true
   *         type: string
   *       - name: point.lon
   *         description: Longitude (decimal degrees)
   *         in: query
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: 200 ok
   *         schema:
   *           type: object
   *           $ref: '#/definitions/standardPeliasReturn'
   *       400:
   *         description: 400 bad request
   *         schema:
   *           type: object
   *           $ref: '#/definitions/standardPeliasErrorReturn'
   * 
   */
  app.get ( base + 'nearby', routers.nearby );
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
