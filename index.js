const logger = require('pelias-logger').get('api');

const app = require('./app'),
    port = ( process.env.PORT || 3100 ),
    host = ( process.env.HOST || undefined );

const server = app.listen( port, host, () => {
  // ask server for the actual address and port its listening on
  const listenAddress = server.address();
  console.log( `pelias is now running on ${listenAddress.address}:${listenAddress.port}` );
});

function exitHandler(signal) {
  logger.info(`Received ${signal}. Starting graceful shutdown.`);

  server.close((err) => {
    if (err) {
      logger.error(err);
      process.exit(1);
    }
    logger.info('Graceful shutdown complete. Exiting.');
    process.exit(0);
  });
}

process.on('SIGINT', exitHandler);
process.on('SIGTERM', exitHandler);
