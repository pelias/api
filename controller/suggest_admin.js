
/**
  README: http://www.elasticsearch.org/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-suggest
**/

var geojsonify = require('../helper/geojsonify').suggest;

function setup( backend, query ){

  // allow overriding of dependencies
  backend = backend || require('../src/backend');
  query = query || require('../query/suggest_admin');

  function controller( req, res, next ){

    // backend command
    var cmd = {
      index: 'pelias',
      body: query( req.clean )
    };

    // query backend
    backend().client.suggest( cmd, function( err, data ){

      var docs = [];

      // handle backend errors
      if( err ){ return next( err ); }

      // map response to a valid FeatureCollection
      if( data && Array.isArray( data.pelias ) && data.pelias.length ){
        docs = data['pelias'][0].options || [];
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