var express = require('express');
var Router = require('express').Router;
var reverseQuery = require('../query/reverse');

/** ----------------------- sanitisers ----------------------- **/
var sanitisers = {
  place: require('../sanitiser/place'),
  search: require('../sanitiser/search'),
  reverse: require('../sanitiser/reverse')
};

/** ----------------------- middleware ------------------------ **/
var middleware = {
  types: require('../middleware/_types')
};

/** ----------------------- controllers ----------------------- **/

var controllers     = {
  mdToHTML: require('../controller/markdownToHtml'),
  place: require('../controller/place'),
  search: require('../controller/search')
};

/** ----------------------- controllers ----------------------- **/

var postProc = {
  distances: require('../middleware/distance'),
  confidenceScores: require('../middleware/confidenceScore'),
  renamePlacenames: require('../middleware/renamePlacenames'),
  geocodeJSON: require('../middleware/geocodeJSON'),
  sendJSON: require('../middleware/sendJSON')
};

/**
 * Append routes to app
 *
 * @param {object} app
 * @param {object} peliasConfig
 */
function addRoutes(app, peliasConfig) {

  /** ------------------------- routers ------------------------- **/

  var routers = {
    index: createRouter([
      controllers.mdToHTML(peliasConfig, './public/apiDoc.md')
    ]),
    attribution: createRouter([
      controllers.mdToHTML(peliasConfig, './public/attribution.md')
    ]),
    search: createRouter([
      sanitisers.search.middleware,
      middleware.types,
      controllers.search(),
      postProc.confidenceScores(peliasConfig),
      postProc.renamePlacenames(),
      postProc.geocodeJSON(peliasConfig),
      postProc.sendJSON
    ]),
    autocomplete: createRouter([
      sanitisers.search.middleware,
      middleware.types,
      controllers.search(null, require('../query/autocomplete')),
      postProc.confidenceScores(peliasConfig),
      postProc.renamePlacenames(),
      postProc.geocodeJSON(peliasConfig),
      postProc.sendJSON
    ]),
    reverse: createRouter([
      sanitisers.reverse.middleware,
      controllers.search(undefined, reverseQuery),
      // TODO: add confidence scores
      postProc.distances(),
      postProc.renamePlacenames(),
      postProc.geocodeJSON(peliasConfig),
      postProc.sendJSON
    ]),
    place: createRouter([
      sanitisers.place.middleware,
      controllers.place(),
      postProc.renamePlacenames(),
      postProc.geocodeJSON(peliasConfig),
      postProc.sendJSON
    ])
  };


  var base = '/v1/';

  // api root
  app.get ( base,                  routers.index );
  app.get ( base + 'attribution',  routers.attribution );
  app.get ( base + 'place',        routers.place );
  app.get ( base + 'autocomplete', routers.autocomplete );
  app.get ( base + 'search',       routers.search );
  app.post( base + 'search',       routers.search );
  app.get ( base + 'reverse',      routers.reverse );
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
