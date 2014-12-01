
var service = {
  suggest: require('../service/suggest'),
  mget: require('../service/mget')
};
var geojsonify = require('../helper/geojsonify').search;

function setup( backend, query ){

  // allow overriding of dependencies
  backend = backend || require('../src/backend');
  query = query || require('../query/suggest');

  function controller( req, res, next ){

    // backend command
    var cmd = {
      index: 'pelias',
      body: query( req.clean )
    };

    // responder
    function reply( docs ){
      
      // convert docs to geojson
      var geojson = geojsonify( docs );

      // response envelope
      geojson.date = new Date().getTime();

      // respond
      return res.status(200).json( geojson );
    }

    // query backend
    service.suggest( backend, cmd, function( err, suggested ){

      // error handler
      if( err ){ return next( err ); }

      // no documents suggested, return empty array to avoid ActionRequestValidationException
      if( !Array.isArray( suggested ) || !suggested.length ){
        return reply([]);
      }

      // map suggester output to mget query
      var query = suggested.map( function( doc ) {
        var idParts = doc.text.split(':');
        return {
          _index: 'pelias',
          _type: idParts[0],
          _id: idParts.slice(1).join(':')
        };
      });

      service.mget( backend, query, function( err, docs ){

        // error handler
        if( err ){ return next( err ); }

        // reply
        return reply( docs );

      });
    });

  }

  return controller;
}

module.exports = setup;