const http = require('http');
const { createTerminus } = require('@godaddy/terminus');
const logger = require('pelias-logger').get('api');

const app = require('./app');
const port = ( process.env.PORT || 3100 );
const host = ( process.env.HOST || undefined );

function onSignal () {
  console.log('server is starting cleanup');
  return Promise.all([
    // your clean logic, like closing database connections
  ]);
}

function beforeShutdown () {
  // given your readiness probes run every 5 second
  // may be worth using a bigger number so you won't
  // run into any race conditions
  return new Promise(resolve => {
    setTimeout(resolve, 10000);
  });
}

function onShutdown () {
  console.log('cleanup finished, server is shutting down');
}

function healthCheck ({ state }) {
  // `state.isShuttingDown` (boolean) shows whether the server is shutting down or not
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
    verbatim: true,                 // [optional = false] use object returned from /healthcheck verbatim in response,
    __unsafeExposeStackTraces: true // [optional = false] return stack traces in error response if healthchecks throw errors
  },

  // cleanup options
  timeout: 1000,                    // [optional = 1000] number of milliseconds before forceful exiting
  onSignal,
  beforeShutdown,
  onShutdown,

  logger: logger.error
};

createTerminus(server, options);

server.listen( port, host, () => {
  // ask server for the actual address and port its listening on
  const listenAddress = server.address();
  console.log( `pelias is now running on ${listenAddress.address}:${listenAddress.port}` );
});

