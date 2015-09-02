
var Router = require('express').Router;

var app = require('express')();

var peliasConfig = require( 'pelias-config' ).generate().api;


if( peliasConfig.accessLog ){
  app.use( require( './middleware/access_log' )( peliasConfig.accessLog ) );
}

/** ----------------------- pre-processing-middleware ----------------------- **/

app.use( require('./middleware/headers') );
app.use( require('./middleware/cors') );
app.use( require('./middleware/jsonp') );

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

var routers = {};

routers.search = createRouter([
  require('./sanitiser/search').middleware,
  require('./controller/search')()
]);

routers.reverse = createRouter([
  require('./sanitiser/reverse').middleware,
  require('./controller/search')(undefined, require('./query/reverse'))
]);

routers.place = createRouter([
  require('./sanitiser/place').middleware,
  require('./controller/place')()
]);

routers.index = createRouter([
  require('./controller/index')()
]);


// api root
app.get( '/', routers.index );

app.get( '/place', routers.place );

app.get( '/autocomplete', routers.search );

app.get( '/search', routers.search);
app.post( '/search', routers.search);

app.get( '/reverse', routers.reverse );


/** -------------------- post-processing-middleware ------------------**/

// TODO: name mapping for admin values (admin0 => country, etc)
app.use(require('./middleware/renamePlacenames')());
app.use(require('./middleware/geocodeJSON')(peliasConfig));
app.use(require('./middleware/sendJSON'));


/** ----------------------- error middleware ----------------------- **/

app.use( require('./middleware/404') );
app.use( require('./middleware/408') );
app.use( require('./middleware/500') );

module.exports = app;