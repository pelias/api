
var app = require('express')();

/** ----------------------- middleware ----------------------- **/

app.use( require('./middleware/toobusy') ); // should be first
app.use( require('./middleware/headers') );
app.use( require('./middleware/cors') );
app.use( require('./middleware/jsonp') );

/** ----------------------- sanitisers ----------------------- **/

var sanitisers = {};
sanitisers.suggest = require('./sanitiser/suggest');

/** ----------------------- controllers ----------------------- **/

var controllers = {};
controllers.index = require('./controller/index');
controllers.suggest = require('./controller/suggest');

/** ----------------------- routes ----------------------- **/

// api root
app.get( '/', controllers.index() );

// suggest API
app.get( '/suggest', sanitisers.suggest.middleware, controllers.suggest() );

/** ----------------------- error middleware ----------------------- **/

app.use( require('./middleware/404') );
app.use( require('./middleware/500') );

module.exports = app;