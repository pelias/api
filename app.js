
var app = require('express')();
var peliasConfig = require( 'pelias-config' ).generate().api;

if( peliasConfig.accessLog ){
  app.use( require( './middleware/access_log' )( peliasConfig.accessLog ) );
}

/** ----------------------- middleware ----------------------- **/

app.use( require('./middleware/headers') );
app.use( require('./middleware/cors') );
app.use( require('./middleware/jsonp') );

/** ----------------------- sanitisers ----------------------- **/

var sanitisers = {};
sanitisers.doc      = require('./sanitiser/doc');
sanitisers.suggest  = require('./sanitiser/suggest');
sanitisers.search   = require('./sanitiser/search');
sanitisers.coarse   = require('./sanitiser/coarse');
sanitisers.reverse  = require('./sanitiser/reverse');

/** ----------------------- controllers ----------------------- **/

var controllers     = {};
controllers.index   = require('./controller/index');
controllers.doc     = require('./controller/doc');
controllers.suggest = require('./controller/suggest');
controllers.search  = require('./controller/search');

/** ----------------------- routes ----------------------- **/

// api root
app.get( '/', controllers.index() );

// doc API
app.get( '/doc', sanitisers.doc.middleware, controllers.doc() );

// suggest APIs
app.get( '/suggest', sanitisers.search.middleware, controllers.search() );
app.get( '/suggest/nearby', sanitisers.suggest.middleware, controllers.search() );
app.get( '/suggest/coarse', sanitisers.coarse.middleware, controllers.search() );

// search APIs
app.get( '/search', sanitisers.search.middleware, controllers.search() );
app.get( '/search/coarse', sanitisers.coarse.middleware, controllers.search() );

// reverse API
app.get( '/reverse', sanitisers.reverse.middleware, controllers.search(undefined, require('./query/reverse')) );

/** ----------------------- error middleware ----------------------- **/

app.use( require('./middleware/404') );
app.use( require('./middleware/500') );

module.exports = app;