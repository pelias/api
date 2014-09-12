
var query = require('../query/suggest'),
    backend = require('../src/backend');

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

    // respond
    return res.status(200).json({
      date: new Date().getTime(),
      body: docs
    });
  });

}

module.exports = controller;