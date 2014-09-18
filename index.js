
var cluster = require('cluster'),
      app = require('./app'),
      multicore = false,
      port = ( process.env.PORT || 3100 );

/** cluster webserver across all cores **/
if( multicore ){
  // @todo: not finished yet
  // cluster(app)
  //   .use(cluster.stats())
  //   .listen( process.env.PORT || 3100 );
}
else {
  console.log( 'listening on ' + port );
  app.listen( process.env.PORT || 3100 );
}
