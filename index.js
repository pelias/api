
var cluster = require('cluster'),
    app = require('./app'),
    port = ( process.env.PORT || 3100 ),
    // when pelias/api#601 is done this can be changed to `true`
    multicore = false;

/** cluster webserver across all cores **/
if( multicore ){

  var numCPUs = require('os').cpus().length;
  if( cluster.isMaster ){

    // fork workers
    for (var i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', function( worker, code, signal ){
      console.log('worker ' + worker.process.pid + ' died');
    });

  } else {
    app.listen( port );
    console.log( 'worker: listening on ' + port );
  }
}

/** run server on the default setup (single core) **/
else {
  console.log( 'listening on ' + port );
  app.listen( port );
}
