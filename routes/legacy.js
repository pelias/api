var proxy = require('express-http-proxy');

function addRoutes(app, peliasConfig) {
  var sendToLegacy;

  if (!peliasConfig.hasOwnProperty('legacyUrl')) {
    sendToLegacy = function doNothing(req, res, next) {
      next(new Error('Invalid path, no legacy proxy specified'));
    };
  }
  else {
    sendToLegacy = proxy(peliasConfig.legacyUrl);
  }

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
