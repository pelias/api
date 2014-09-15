
var app = require('express')();

/** ----------------------- middleware ----------------------- **/

app.use( require('./middleware/headers') );
app.use( require('./middleware/cors') );
app.use( require('./middleware/jsonp') );

/** ----------------------- routes ----------------------- **/

// api root
app.get( '/', require('./controller/index') );

// suggest API
app.get( '/suggest', require('./sanitiser/suggest'), require('./controller/suggest') );

/** ----------------------- error middleware ----------------------- **/

app.use( require('./middleware/404') );
app.use( require('./middleware/500') );

app.listen( process.env.PORT || 3100 );