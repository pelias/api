// set up routes that are outside any particular API version
function addRoutes(app) {
  function redirectToV1(req, res, next) {
    res.redirect(301, '/v1');
  }

  // default root URL traffic to V1 root
  // which has a link to the readme and other helpful info
  app.get('/', redirectToV1);
}

module.exports.addRoutes = addRoutes;
