const logger = require('pelias-logger').get('api');
const GracefulShutdownManager = require('@moebius/http-graceful-shutdown').GracefulShutdownManager;

const app = require('./app'),
    port = ( process.env.PORT || 3100 ),
    host = ( process.env.HOST || undefined );

const server = app.listen( port, host, () => {
  // ask server for the actual address and port its listening on
  const listenAddress = server.address();
  console.log( `pelias is now running on ${listenAddress.address}:${listenAddress.port}` );
});

const shutdownManager = new GracefulShutdownManager(server);

function exitHandler(signal) {
  logger.info(`Received ${signal}. Starting graceful shutdown.`);

  shutdownManager.terminate(() => {
    logger.info('Graceful shutdown complete. Exiting.');
  });
}

process.on('SIGINT', exitHandler);
process.on('SIGTERM', exitHandler);
