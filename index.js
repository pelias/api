const http = require('http');
const { createTerminus } = require('@godaddy/terminus');
const logger = require('pelias-logger').get('api');

const app = require('./app');
const port = ( process.env.PORT || 3100 );
const host = ( process.env.HOST || undefined );

function onSignal () {
  logger.warn('server is starting cleanup');
  return Promise.all([
    // your clean logic, like closing database connections
  ]);
}

function beforeShutdown () {
  logger.warn('server will shut down');

  return new Promise(resolve => {
    setTimeout(resolve, 20000);
  });
}

function onShutdown () {
  logger.warn('cleanup finished, server is shutting down');
}

function healthCheck ({ state }) {
  // `state.isShuttingDown` (boolean) shows whether the server is shutting down or not
  if (state.isShuttingDown) {
    return Promise.reject();
  }

  return Promise.resolve(
    // optionally include a resolve value to be included as
    // info in the health check response
  );
}

const server = http.createServer(app);

const options = {
  // health check options
  healthChecks: {
    '/healthcheck': healthCheck,    // a function accepting a state and returning a promise indicating service health,
  },

  // cleanup options
  timeout: 1000,                    // [optional = 1000] number of milliseconds before forceful exiting
  onSignal,
  beforeShutdown,
  onShutdown,
  useExit0: true,
  logger: logger.error
};

createTerminus(server, options);

server.listen( port, host, () => {
  // ask server for the actual address and port its listening on
  const listenAddress = server.address();
  logger.warn( `pelias is now running on ${listenAddress.address}:${listenAddress.port}` );
});
