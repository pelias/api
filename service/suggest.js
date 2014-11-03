
/**

  cmd can be any valid ES suggest command

**/

function service( backend, cmd, cb ){
  
  // query new backend
  backend().client.suggest( cmd, function( err, data ){

    // handle backend errors
    if( err ){ return cb( err ); }

    // map returned documents
    var docs = [];
    if( data && Array.isArray( data.pelias ) && data.pelias.length ){
      docs = data['pelias'][0].options || [];
    }

    // fire callback
    return cb( null, docs );
  });

}

module.exports = service;