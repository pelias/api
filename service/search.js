
/**

  cmd can be any valid ES query command

**/

function service( backend, cmd, cb ){
  
  // query new backend
  backend().client.search( cmd, function( err, data ){

    // handle backend errors
    if( err ){ return cb( err ); }

    // map returned documents
    var docs = [];
    if( data && data.hits && data.hits.total && Array.isArray(data.hits.hits)){
      docs = data.hits.hits.map( function( hit ){
        return hit._source;
      });
    }

    // fire callback
    return cb( null, docs );
  });

}

module.exports = service;