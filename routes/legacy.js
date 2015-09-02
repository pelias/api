var proxy = require('express-http-proxy');

function addRoutes(app, peliasConfig) {
  if (!peliasConfig.hasOwnProperty('legacyUrl')) {
    return;
  }

  var sendToLegacy = proxy(peliasConfig.legacyUrl);

  // api root
  app.get( '/', sendToLegacy );

  // place API
  app.get( '/place', sendToLegacy);

  // suggest APIs
  app.get( '/suggest', sendToLegacy );
  app.get( '/suggest/nearby', sendToLegacy );
  app.get( '/suggest/coarse',sendToLegacy );

  // search APIs
  app.get( '/search', sendToLegacy);
  app.get( '/search/coarse', sendToLegacy);

  // reverse API
  app.get( '/reverse', sendToLegacy );
}

module.exports.addRoutes = addRoutes;
