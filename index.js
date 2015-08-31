
var Cluster = require('cluster2'),
    app = require('./app'),
    port = ( process.env.PORT || 3100 ),
    multicore = true;

/** cluster webserver across all cores **/
if( multicore ){
  var c = new Cluster({ port: port });
  c.listen(function(cb){
    console.log( 'worker: listening on ' + port );
    cb(app);
  });
}

/** run server on the default setup (single core) **/
else {
  console.log( 'listening on ' + port );
  app.listen( port );
}