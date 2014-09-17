
var app = require('express')();

/** ----------------------- middleware ----------------------- **/

app.use( require('./middleware/headers') );
app.use( require('./middleware/cors') );
app.use( require('./middleware/jsonp') );

/** ----------------------- routes ----------------------- **/

// api root
app.get( '/', require('./controller/index') );

// suggest API
app.get( '/suggest', require('./sanitiser/sanitise'), require('./controller/suggest') );

// search API
app.get( '/search', require('./sanitiser/sanitise'), require('./middleware/search'), require('./controller/search') );

// reverse API
app.get( '/reverse', require('./sanitiser/sanitise'), require('./middleware/reverse'), require('./controller/search') );

/** ----------------------- error middleware ----------------------- **/

app.use( require('./middleware/404') );
app.use( require('./middleware/500') );

app.listen( process.env.PORT || 3100 );