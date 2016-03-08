
/**

  cmd can be any valid ES query command

**/

var peliasLogger = require( 'pelias-logger' ).get( 'service/msearch' );
var processResult = require( './_searchCommon' ).processResult;

function service( backend, cmd, cb ){

  // query new backend
  backend().client.msearch( cmd, function( err, data ){

    // handle backend errors
    if( err ){ return cb( err ); }

    // log total ms elasticsearch reported the query took to execute
    var took = data.responses.map(function(r) { return r.took / 1000; });
    peliasLogger.verbose( 'time elasticsearch reported:', took );

    var results = data.responses.map( processResult );

    // fire callback
    return cb( null, results );
  });

}

module.exports = service;
