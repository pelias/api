const os = require('os');
const cluster = require('cluster');

const logger = require('pelias-logger').get('api');
const type_mapping = require('./helper/type_mapping');

const app = require('./app'),
    port = ( process.env.PORT || 3100 ),
    host = ( process.env.HOST || undefined );

// determine the number of processes to launch
// by default launch only a single process,
// but if the CPUS environment variable is set, launch up to one process per CPU detected
const envCpus = parseInt( process.env.CPUS, 10 );
const cpus = Math.min( envCpus || 1 , os.cpus().length );

let server;
let terminating = false;

logger.info('Starting Pelias API using %d CPUs', cpus);

// simple case where cluster module is disabled with CPUS=1
// or if this is a worker
if ( cpus === 1 || cluster.isWorker ) {
  startServer();
// if using the cluster module, do more work to set up all the workers
} else if ( cluster.isMaster ) {
  // listen to worker ready message and print a message
  cluster.on('online', (worker) => {
    if (Object.keys(cluster.workers).length === cpus) {
      logger.info( `pelias is now running on http://${host || `::`}:${port}` );
    }
  });

  // set up worker exit event that prints error message
  cluster.on('exit', (worker, code, signal) => {
    if (!terminating) {
      logger.error('[master] worker died', worker.process.pid);
    }
  });

  // create a handler that prints when a new worker is created via fork
  cluster.on('fork', (worker, code, signal) => {
    logger.info('[master] worker forked', worker.process.pid);
  });

  // call fork to create the desired number of workers
  for( var c=0; c<cpus; c++ ){
    cluster.fork();
  }
}

// an exit handler that either closes the local Express server
// or, if using the cluster module, forwards the signal to all workers
function exitHandler() {
  terminating = true;
  if (cluster.isMaster) {
    logger.info('Pelias API shutting down');
    for (const id in cluster.workers) {
      cluster.workers[id].kill('SIGINT');
    }
  }

  if (server) {
    server.close();
  }
}

function startServer() {
  // load Elasticsearch type_mapping before starting the web server
  // This has to be run on each forked worker because unlike "real"
  // unix `fork`, these forks don't share memory with other workers
  type_mapping.load(() => {
    server = app.listen( port, host, () => {
      // ask server for the actual address and port its listening on
      const listenAddress = server.address();
      if (cluster.isMaster) {
        logger.info( `pelias is now running on http://${listenAddress.address}:${listenAddress.port}` );
      } else {
        logger.info( `pelias worker ${process.pid} online` );
      }
    });
  });
}

process.on('SIGINT', exitHandler);
process.on('SIGTERM', exitHandler);
