
const app = require('./app'),
    typeMapping = require('./helper/type_mapping'),
    port = ( process.env.PORT || 3100 ),
    host = ( process.env.HOST || undefined );

// ensure the dynamic type mappings are loaded before starting the server.
typeMapping.load(() => {
  const server = app.listen( port, host, () => {
    // ask server for the actual address and port its listening on
    const listenAddress = server.address();
    console.log( `pelias is now running on ${listenAddress.address}:${listenAddress.port}` );
  });
});