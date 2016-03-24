
/**

  query must be an array of hashes, structured like so:

  {
    _index: 'myindex',
    _type: 'mytype',
    _id: 'myid'
  }

**/

var peliasLogger = require( 'pelias-logger' ).get( 'service/mget' );

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

      docs = data.docs.filter( function( doc ){

        // remove docs not actually found
        return doc.found;

      }).map( function( doc ){

        // map metadata in to _source so we
        // can serve it up to the consumer
        doc._source._id = doc._id;
        doc._source._type = doc._type;

        return doc._source;
      });
    }

    // fire callback
    return cb( null, docs );
  });

}

module.exports = service;
