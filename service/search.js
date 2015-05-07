
/**

  cmd can be any valid ES query command

**/

var peliasLogger = require( 'pelias-logger' ).get( 'service/search' );
var microtime = require( 'microtime' );

function service( backend, cmd, cb ){
  
  var startTime = microtime.nowDouble();
  // query new backend
  backend().client.search( cmd, function( err, data ){
    peliasLogger.verbose( 'time elasticsearch query took:', microtime.nowDouble() - startTime );

    // handle backend errors
    if( err ){ return cb( err ); }

    // map returned documents
    var docs = [];
    if( data && data.hits && data.hits.total && Array.isArray(data.hits.hits)){
      docs = data.hits.hits.map( function( hit ){

        // map metadata in to _source so we
        // can serve it up to the consumer
        hit._source._id = hit._id;
        hit._source._type = hit._type;

        return hit._source;
      });
    }

    // fire callback
    return cb( null, docs );
  });

}

module.exports = service;
