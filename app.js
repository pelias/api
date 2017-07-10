
var app = require('express')();

var peliasConfig = require( 'pelias-config' ).generate(require('./schema'));

if( peliasConfig.api.accessLog ){
  app.use( require( './middleware/access_log' ).createAccessLogger( peliasConfig.api.accessLog ) );
}

/** ----------------------- pre-processing-middleware ----------------------- **/

app.use( require('./middleware/headers') );
app.use( require('./middleware/cors') );
app.use( require('./middleware/options') );
app.use( require('./middleware/jsonp') );

/** ----------------------- routes ----------------------- **/

var v1 = require('./routes/v1');
v1.addRoutes(app, peliasConfig);

/** ----------------------- error middleware ----------------------- **/

app.use( require('./middleware/404') );
app.use( require('./middleware/500') );

module.exports = app;
