
var app = require('express')();
var bodyParser = require('body-parser');

var peliasConfig = require( 'pelias-config' ).generate().api;


if( peliasConfig.accessLog ){
  app.use( require( './middleware/access_log' )( peliasConfig.accessLog ) );
}

/** ----------------------- pre-processing-middleware ----------------------- **/

app.use( require('./middleware/headers') );
app.use( require('./middleware/cors') );
app.use( require('./middleware/options') );
app.use( require('./middleware/jsonp') );
app.use( bodyParser.json() ); // for parsing application/json
app.use( bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

/** ----------------------- routes ----------------------- **/

var legacy = require('./routes/legacy');
legacy.addRoutes(app, peliasConfig);

var v1 = require('./routes/v1');
v1.addRoutes(app, peliasConfig);

/** ----------------------- error middleware ----------------------- **/

app.use( require('./middleware/404') );
app.use( require('./middleware/500') );

module.exports = app;
