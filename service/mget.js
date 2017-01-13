
/**

  query must be an array of hashes, structured like so:

  {
    _index: 'myindex',
    _type: 'mytype',
    _id: 'myid'
  }

**/

var logger = require( 'pelias-logger' ).get( 'api' );

function service( esclient, query, cb ){

  // elasticsearch command
  var cmd = {
    body: {
      docs: query
    }
  };

  // query elasticsearch
  esclient.mget( cmd, function( err, data ){

    // log total ms elasticsearch reported the query took to execute
    if( data && data.took ){
      logger.verbose( 'time elasticsearch reported:', data.took / 1000 );
    }

    // handle elasticsearch errors
    if( err ){
      logger.error( `elasticsearch error ${err}`);
      return cb( err );
    }

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
