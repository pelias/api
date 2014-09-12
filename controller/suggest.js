
var logger = require('../src/logger'),
    responder = require('../src/responder'),
    query = require('../query/suggest'),
    backend = require('../src/backend');

module.exports = function( req, res, next ){

  var reply = {
    date: new Date().getTime(),
    body: []
  };

  var cmd = {
    index: 'pelias',
    body: query( req.clean ) // generate query from clean params
  };

  // Proxy request to ES backend & map response to a valid FeatureCollection
  backend().client.suggest( cmd, function( err, data ){

    if( err ){ return responder.error( req, res, next, err ); }
    if( data && data.pelias && data.pelias.length ){

      // map options to reply body
      reply.body = data['pelias'][0].options;
    }

    return responder.cors( req, res, reply );
  });

};