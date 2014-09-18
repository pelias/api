
/** cluster webserver across all cores **/

var cluster = require('cluster'),
    app = require('./app');

cluster(app)
  .use(cluster.stats())
  .listen( process.env.PORT || 3100 );