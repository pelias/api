var proxy = require('express-http-proxy');

var sendToLegacy = proxy('pelias.mapzen.com', {
  forwardPath: function(req, res) {
    return require('url').parse(req.url).path;
  }
});

function addRoutes(app) {
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
