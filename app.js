
var app = require('express')();

var peliasConfig = require( 'pelias-config' ).generate(require('./schema'));
const logger = require('pelias-logger').get('api');

if( peliasConfig.api.accessLog ){
  app.use( require( './middleware/access_log' ).createAccessLogger( peliasConfig.api.accessLog ) );
}

// indexName config value has been moved to 'schema' root child, so warn if
// it's in the old place
if (peliasConfig.api.hasOwnProperty('indexName')) {
  logger.warn('deprecation warning: api.indexName has been relocated to schema.indexName');
}

/** ----------------------- pre-processing-middleware ----------------------- **/

app.use( require('./middleware/headers') );
app.use( require('./middleware/cors') );
app.use( require('./middleware/options') );
app.use( require('./middleware/jsonp') );

/** ----------------------- routes ----------------------- **/

var legacy = require('./routes/legacy');
legacy.addRoutes(app, peliasConfig.api);

var v1 = require('./routes/v1');
v1.addRoutes(app, peliasConfig);

/** ----------------------- error middleware ----------------------- **/

app.use( require('./middleware/404') );
app.use( require('./middleware/500') );

module.exports = app;
