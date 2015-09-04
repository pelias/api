var Router = require('express').Router;
var reverseQuery = require('../query/reverse');

/** ----------------------- sanitisers ----------------------- **/
var sanitisers = {
  place: require('../sanitiser/place'),
  search: require('../sanitiser/search'),
  reverse: require('../sanitiser/reverse')
};

/** ----------------------- controllers ----------------------- **/

var controllers     = {
  index: require('../controller/index'),
  place: require('../controller/place'),
  search: require('../controller/search')
};

/** ----------------------- controllers ----------------------- **/

var postProc = {
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
      controllers.index()
    ]),
    search: createRouter([
      sanitisers.search.middleware,
      controllers.search(),
      postProc.confidenceScores(peliasConfig),
      postProc.renamePlacenames(),
      postProc.geocodeJSON(peliasConfig),
      postProc.sendJSON
    ]),
    reverse: createRouter([
      sanitisers.reverse.middleware,
      controllers.search(undefined, reverseQuery),
      // TODO: add confidence scores
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
  app.get ( base + 'place',        routers.place );
  app.get ( base + 'autocomplete', routers.search );
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
