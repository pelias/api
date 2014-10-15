
var geojsonify = require('../helper/geojsonify').search;

function setup( backend ){

  // allow overriding of dependencies
  backend = backend || require('../src/backend');

  function controller( req, res, next ){
    
    // backend command
    var cmd = req.clean.ids.map( function(id) {
      return {
        index: 'pelias',
        type: id.type,
        id: id.id
      };
    });
    cmd = {
      index: 'pelias',
      type: 'geoname',
      ids: cmd.map(function(c){ return c.id })
    }
    console.log('cmd:')
    console.log(cmd)
    // query backend
    backend().client.mget( cmd, function( err, data ){
      console.log('error:')
      console.log(err)
      var docs = [];
      // handle backend errors
      if( err ){ return next( err ); }

      if( data && data.docs && Array.isArray(data.docs) && data.docs.length ){
        docs = data.docs.map( function( doc ){
          return doc._source;
        });
      }

      // convert docs to geojson
      var geojson = geojsonify( docs );

      // response envelope
      geojson.date = new Date().getTime();

      // respond
      return res.status(200).json( geojson );
    });

  }

  return controller;
}

module.exports = setup;
