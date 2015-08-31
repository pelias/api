/** ----------------------- sanitisers ----------------------- **/
var sanitisers = {};
sanitisers.place      = require('../sanitiser/place');
sanitisers.suggest  = require('../sanitiser/suggest');
sanitisers.search   = require('../sanitiser/search');
sanitisers.coarse   = require('../sanitiser/coarse');
sanitisers.reverse  = require('../sanitiser/reverse');

/** ----------------------- controllers ----------------------- **/

var controllers     = {};
controllers.index   = require('../controller/index');
controllers.place     = require('../controller/place');
controllers.search  = require('../controller/search');

function addRoutes(app) {
  // api root
  app.get( '/', controllers.index() );

  // place API
  app.get( '/place', sanitisers.place.middleware, controllers.place() );

  // suggest APIs
  app.get( '/suggest', sanitisers.search.middleware, controllers.search() );
  app.get( '/suggest/nearby', sanitisers.suggest.middleware, controllers.search() );
  app.get( '/suggest/coarse', sanitisers.coarse.middleware, controllers.search() );

  // search APIs
  app.get( '/search', sanitisers.search.middleware, controllers.search() );
  app.get( '/search/coarse', sanitisers.coarse.middleware, controllers.search() );

  // reverse API
  app.get( '/reverse', sanitisers.reverse.middleware, controllers.search(undefined, require('../query/reverse')) );
}

module.exports.addRoutes = addRoutes;
