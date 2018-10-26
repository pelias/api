const logger = require('pelias-logger').get('api');
const app = require('./app'),
    port = ( process.env.PORT || 3100 ),
    host = ( process.env.HOST || undefined );

const server = app.listen( port, host, () => {
  // ask server for the actual address and port its listening on
  const listenAddress = server.address();
  logger.info( `pelias is now running on ${listenAddress.address}:${listenAddress.port}` );
});
