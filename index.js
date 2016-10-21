
var app = require('./app'),
    port = ( process.env.PORT || 3100 );

/** run server on the default setup (single core) **/
console.log( 'listening on ' + port );
app.listen( port );
