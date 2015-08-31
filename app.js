
var app = require('express')();
var peliasConfig = require( 'pelias-config' ).generate().api;

if( peliasConfig.accessLog ){
  app.use( require( './middleware/access_log' )( peliasConfig.accessLog ) );
}

/** ----------------------- middleware ----------------------- **/

app.use( require('./middleware/headers') );
app.use( require('./middleware/cors') );
app.use( require('./middleware/jsonp') );


/** ----------------------- routes ----------------------- **/
var legacy = require('./routes/legacy');
legacy.addRoutes(app, peliasConfig);

var v1 = require('./routes/v1');
v1.addRoutes(app, peliasConfig);

/** ----------------------- error middleware ----------------------- **/

app.use( require('./middleware/404') );
app.use( require('./middleware/408') );
app.use( require('./middleware/500') );

module.exports = app;
