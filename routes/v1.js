/** ----------------------- sanitisers ----------------------- **/
var sanitisers = {};
sanitisers.place      = require('../sanitiser/place');
sanitisers.suggest  = require('../sanitiser/suggest');
sanitisers.search   = require('../sanitiser/search');
sanitisers.coarse   = require('../sanitiser/coarse');
sanitisers.reverse  = require('../sanitiser/reverse');

/** ---------------------- routing --------------------------- **/
var routers = {};
routers.semver = require('../middleware/semver');

/** ----------------------- controllers ----------------------- **/

var controllers     = {};
controllers.index   = require('../controller/index');
controllers.place     = require('../controller/place');
controllers.search  = require('../controller/search');

function addRoutes(app, peliasConfig) {
  // api root
  app.get( '/:vr/', controllers.index() );

  // place API
  app.get( '/:vr/place', sanitisers.place.middleware, controllers.place() );

  // suggest APIs
  app.get( '/:vr/suggest', sanitisers.search.middleware, controllers.search() );
  app.get( '/:vr/suggest/nearby', sanitisers.suggest.middleware, controllers.search() );
  app.get( '/:vr/suggest/coarse', sanitisers.coarse.middleware, controllers.search() );

  // search APIs
  app.get( '/:vr/search', routers.semver(peliasConfig), sanitisers.search.middleware, controllers.search() );
  app.get( '/:vr/search/coarse', sanitisers.coarse.middleware, controllers.search() );

  // reverse API
  app.get( '/:vr/reverse', sanitisers.reverse.middleware, controllers.search(undefined, require('../query/reverse')) );
}

module.exports.addRoutes = addRoutes;
