
/**

  query must be an array of hashes, structured like so:

  {
    _index: 'myindex',
    _type: 'mytype',
    _id: 'myid'
  }

**/

function service( backend, query, cb ){

  // backend command
  var cmd = {
    body: {
      docs: query
    }
  };
  
  // query new backend
  backend().client.mget( cmd, function( err, data ){

    // handle backend errors
    if( err ){ return cb( err ); }

    // map returned documents
    var docs = [];
    if( data && Array.isArray(data.docs) ){
      docs = data.docs.map( function( doc ){
        return doc._source;
      });
    }

    // fire callback
    return cb( null, docs );
  });

}

module.exports = service;