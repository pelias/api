
var app = require('express')();

/** ----------------------- middleware ----------------------- **/

app.use( require('./middleware/toobusy') ); // should be first
app.use( require('./middleware/headers') );
app.use( require('./middleware/cors') );
app.use( require('./middleware/jsonp') );

var middlewares = {};
middlewares.search  = require('./middleware/search');

/** ----------------------- sanitisers ----------------------- **/

var sanitisers = {};
sanitisers.suggest  = require('./sanitiser/suggest');
sanitisers.search   = sanitisers.suggest;
sanitisers.reverse  = require('./sanitiser/reverse');

/** ----------------------- controllers ----------------------- **/

var controllers     = {};
controllers.index   = require('./controller/index');
controllers.suggest = require('./controller/suggest');
controllers.search  = require('./controller/search');

/** ----------------------- routes ----------------------- **/

// api root
app.get( '/', controllers.index() );

// suggest API
app.get( '/suggest', sanitisers.suggest.middleware, controllers.suggest() );

// search API
app.get( '/search', sanitisers.search.middleware, controllers.search() );

// reverse API
app.get( '/reverse', sanitisers.reverse.middleware, controllers.search(undefined, require('./query/reverse')) );


/** ----------------------- error middleware ----------------------- **/

app.use( require('./middleware/404') );
app.use( require('./middleware/500') );

module.exports = app;