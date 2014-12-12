
var app = require('express')();

/** ----------------------- middleware ----------------------- **/

app.use( require('./middleware/toobusy') ); // should be first
app.use( require('./middleware/headers') );
app.use( require('./middleware/cors') );
app.use( require('./middleware/jsonp') );

/** ----------------------- sanitisers ----------------------- **/

var sanitisers = {};
sanitisers.doc      = require('./sanitiser/doc');
sanitisers.suggest  = require('./sanitiser/suggest');
sanitisers.search   = sanitisers.suggest;
sanitisers.reverse  = require('./sanitiser/reverse');

/** ----------------------- controllers ----------------------- **/

var controllers     = {};
controllers.index   = require('./controller/index');
controllers.doc     = require('./controller/doc');
controllers.suggest = require('./controller/suggest');
controllers.suggest_nearby = require('./controller/suggest_nearby');
controllers.search  = require('./controller/search');

/** ----------------------- routes ----------------------- **/

// api root
app.get( '/', controllers.index() );

// doc API
app.get( '/doc', sanitisers.doc.middleware, controllers.doc() );

// suggest API
app.get( '/suggest', sanitisers.suggest.middleware, controllers.suggest() );
app.get( '/suggest/nearby', 
		sanitisers.suggest.middleware, 
		controllers.suggest_nearby(undefined, undefined, require('./helper/queryMixer').suggest_nearby) );

// search API
app.get( '/search', sanitisers.search.middleware, controllers.search() );

// reverse API
app.get( '/reverse', sanitisers.reverse.middleware, controllers.search(undefined, require('./query/reverse')) );


/** ----------------------- error middleware ----------------------- **/

app.use( require('./middleware/404') );
app.use( require('./middleware/500') );

module.exports = app;