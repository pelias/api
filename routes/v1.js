
var express = require('express');
var Router = require('express').Router;
var reverseQuery = require('../query/reverse');

/** ----------------------- sanitizers ----------------------- **/
var sanitizers = {
  autocomplete: require('../sanitizer/autocomplete'),
  place: require('../sanitizer/place'),
  search: require('../sanitizer/search'),
  search_fallback: require('../sanitizer/search_fallback'),
  structured_geocoding: require('../sanitizer/structured_geocoding'),
  reverse: require('../sanitizer/reverse'),
  nearby: require('../sanitizer/nearby')
};

/** ----------------------- middleware ------------------------ **/
var middleware = {
  calcSize: require('../middleware/sizeCalculator'),
  selectLanguage: require('../middleware/languageSelector')
};

/** ----------------------- controllers ----------------------- **/

var controllers = {
  mdToHTML: require('../controller/markdownToHtml'),
  place: require('../controller/place'),
  search: require('../controller/search'),
  status: require('../controller/status')
};

var queries = {
  libpostal: require('../query/search'),
  fallback_to_old_prod: require('../query/search_original'),
  structured_geocoding: require('../query/structured_geocoding')
};

/** ----------------------- controllers ----------------------- **/

var postProc = {
  matchLanguage: require('../middleware/matchLanguage'),
  trimByGranularity: require('../middleware/trimByGranularity'),
  trimByGranularityStructured: require('../middleware/trimByGranularityStructured'),
  distances: require('../middleware/distance'),
  confidenceScores: require('../middleware/confidenceScoreDT'),
  confidenceScoresFallback: require('../middleware/confidenceScoreFallback'),
  confidenceScoresReverse: require('../middleware/confidenceScoreReverse'),
  accuracy: require('../middleware/accuracy'),
  dedupe: require('../middleware/dedupe'),
  localNamingConventions: require('../middleware/localNamingConventions'),
  translate: require('../middleware/translate'),
  renamePlacenames: require('../middleware/renamePlacenames'),
  geocodeJSON: require('../middleware/geocodeJSON'),
  sendJSON: require('../middleware/sendJSON'),
  parseBoundingBox: require('../middleware/parseBBox'),
  normalizeParentIds: require('../middleware/normalizeParentIds'),
  assignLabels: require('../middleware/label')
};

/**
 * Append routes to app
 *
 * @param {object} app
 * @param {object} peliasConfig
 */
function addRoutes(app, peliasConfig) {

  var base = '/v1/';

  /** ------------------------- routers ------------------------- **/

  var routers = {
    index: createRouter([
      controllers.mdToHTML(peliasConfig, './public/apiDoc.md')
    ]),
    attribution: createRouter([
      controllers.mdToHTML(peliasConfig, './public/attribution.md')
    ]),
    search: createRouter([
      sanitizers.search.middleware,
      middleware.calcSize(),
      middleware.selectLanguage(peliasConfig),
      // 2nd parameter is `backend` which gets initialized internally
      // 3rd parameter is which query module to use, use fallback/geodisambiguation
      //  first, then use original search strategy if first query didn't return anything
      controllers.search(peliasConfig, undefined, queries.libpostal),
      sanitizers.search_fallback.middleware,
      controllers.search(peliasConfig, undefined, queries.fallback_to_old_prod),
      postProc.trimByGranularity(),
      postProc.distances('focus.point.'),
      postProc.localNamingConventions(),
      postProc.confidenceScores(peliasConfig),
      postProc.matchLanguage(peliasConfig),
      postProc.dedupe(),
      postProc.accuracy(),
      postProc.translate(),
      postProc.renamePlacenames(),
      postProc.parseBoundingBox(),
      postProc.normalizeParentIds(),
      postProc.assignLabels(),
      postProc.geocodeJSON(peliasConfig, base),
      postProc.sendJSON
    ]),
    structured: createRouter([
      sanitizers.structured_geocoding.middleware,
      middleware.calcSize(),
      controllers.search(peliasConfig, undefined, queries.structured_geocoding),
      postProc.trimByGranularityStructured(),
      postProc.distances('focus.point.'),
      postProc.confidenceScores(peliasConfig),
      postProc.confidenceScoresFallback(),
      postProc.dedupe(),
      postProc.accuracy(),
      postProc.localNamingConventions(),
      postProc.renamePlacenames(),
      postProc.parseBoundingBox(),
      postProc.normalizeParentIds(),
      postProc.assignLabels(),
      postProc.geocodeJSON(peliasConfig, base),
      postProc.sendJSON
    ]),
    autocomplete: createRouter([
      sanitizers.autocomplete.middleware,
      middleware.selectLanguage(peliasConfig),
      controllers.search(peliasConfig, null, require('../query/autocomplete')),
      postProc.distances('focus.point.'),
      postProc.localNamingConventions(),
      postProc.confidenceScores(peliasConfig),
      postProc.matchLanguage(peliasConfig),
      postProc.dedupe(),
      postProc.accuracy(),
      postProc.translate(),
      postProc.renamePlacenames(),
      postProc.parseBoundingBox(),
      postProc.normalizeParentIds(),
      postProc.assignLabels(),
      postProc.geocodeJSON(peliasConfig, base),
      postProc.sendJSON
    ]),
    reverse: createRouter([
      sanitizers.reverse.middleware,
      middleware.calcSize(),
      middleware.selectLanguage(peliasConfig),
      controllers.search(peliasConfig, undefined, reverseQuery),
      postProc.distances('point.'),
      // reverse confidence scoring depends on distance from origin
      //  so it must be calculated first
      postProc.confidenceScoresReverse(),
      postProc.dedupe(),
      postProc.accuracy(),
      postProc.localNamingConventions(),
      postProc.translate(),
      postProc.renamePlacenames(),
      postProc.parseBoundingBox(),
      postProc.normalizeParentIds(),
      postProc.assignLabels(),
      postProc.geocodeJSON(peliasConfig, base),
      postProc.sendJSON
    ]),
    nearby: createRouter([
      sanitizers.nearby.middleware,
      middleware.calcSize(),
      middleware.selectLanguage(peliasConfig),
      controllers.search(peliasConfig, undefined, reverseQuery),
      postProc.distances('point.'),
      // reverse confidence scoring depends on distance from origin
      //  so it must be calculated first
      postProc.confidenceScoresReverse(),
      postProc.dedupe(),
      postProc.accuracy(),
      postProc.localNamingConventions(),
      postProc.translate(),
      postProc.renamePlacenames(),
      postProc.parseBoundingBox(),
      postProc.normalizeParentIds(),
      postProc.assignLabels(),
      postProc.geocodeJSON(peliasConfig, base),
      postProc.sendJSON
    ]),
    place: createRouter([
      sanitizers.place.middleware,
      middleware.selectLanguage(peliasConfig),
      controllers.place(peliasConfig),
      postProc.accuracy(),
      postProc.localNamingConventions(),
      postProc.translate(),
      postProc.renamePlacenames(),
      postProc.parseBoundingBox(),
      postProc.normalizeParentIds(),
      postProc.assignLabels(),
      postProc.geocodeJSON(peliasConfig, base),
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
