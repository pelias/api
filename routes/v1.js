const elasticsearch = require('elasticsearch');

const serviceWrappers = require('../service');
const utils = require('./routers/utils');

/**
 * Append routes to app
 *
 * @param {object} app
 * @param {object} peliasConfig
 */
function addRoutes(app, peliasConfig) {

  const esclient = elasticsearch.Client(peliasConfig.esclient);

  const services = serviceWrappers.create(peliasConfig);

  const routers = {
    index: require('./routers/index').create(peliasConfig),
    attribution: require('./routers/attribution').create(peliasConfig),
    search: require('./routers/search').create(peliasConfig, esclient, services),
    structured: require('./routers/structured').create(peliasConfig, esclient, services),
    autocomplete: require('./routers/autocomplete').create(peliasConfig, esclient, services),
    reverse: require('./routers/reverse').create(peliasConfig, esclient, services),
    nearby: require('./routers/nearby').create(peliasConfig, esclient, services),
    place: require('./routers/place').create(peliasConfig, esclient, services),
    status: require('./routers/status').create()
  };


  // static data endpoints
  app.get ( utils.base,                          routers.index );
  app.get ( utils.base + 'attribution',          routers.attribution );
  app.get (              '/attribution',         routers.attribution );
  app.get (              '/status',              routers.status );

  // backend dependent endpoints
  app.get ( utils.base + 'place',                routers.place );
  app.get ( utils.base + 'autocomplete',         routers.autocomplete );
  app.get ( utils.base + 'search',               routers.search );
  app.post( utils.base + 'search',               routers.search );
  app.get ( utils.base + 'search/structured',    routers.structured );
  app.get ( utils.base + 'reverse',              routers.reverse );
  app.get ( utils.base + 'nearby',               routers.nearby );

}


module.exports.addRoutes = addRoutes;
