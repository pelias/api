
const app = require('./app'),
    port = ( process.env.PORT || 3100 ),
    host = ( process.env.HOST || undefined );

/** run server on the default setup (single core) **/
console.log( `pelias is now running on ${host}:${port}` );
app.listen( port, host );
