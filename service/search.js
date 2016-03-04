
/**

  cmd can be any valid ES query command

**/

var peliasLogger = require( 'pelias-logger' ).get( 'service/search' );
var processResult = require( './_searchCommon' ).processResult;

function service( backend, cmd, cb ){

  // query new backend
  backend().client.search( cmd, function( err, data ){

    // handle backend errors
    if( err ){ return cb( err ); }

    // log total ms elasticsearch reported the query took to execute
    peliasLogger.verbose( 'time elasticsearch reported:', data.took / 1000 );

    var result = processResult( data );

    // fire callback
    return cb( null, result.docs, result.meta );
  });

}

module.exports = service;
