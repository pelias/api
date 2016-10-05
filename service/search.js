
/**

  cmd can be any valid ES query command

**/

var peliasLogger = require( 'pelias-logger' ).get( 'service/search' );

function service( backend, cmd, cb ){

  // query new backend
  backend().client.search( cmd, function( err, data ){

    // handle backend errors
    if( err ){ return cb( err ); }

    // log total ms elasticsearch reported the query took to execute
    peliasLogger.verbose( 'time elasticsearch reported:', data.took / 1000 );

    // map returned documents
    var docs = [];
    var meta = {
      scores: []
    };

    if( data && data.hits && data.hits.total && Array.isArray(data.hits.hits)){

      docs = data.hits.hits.map( function( hit ){

        meta.scores.push(hit._score);

        // map metadata in to _source so we
        // can serve it up to the consumer
        hit._source._id = hit._id;
        hit._source._type = hit._type;
        hit._source._score = hit._score;
        hit._source._matched_queries = hit.matched_queries;

        return hit._source;
      });
    }

    // fire callback
    return cb( null, docs, meta );
  });

}

module.exports = service;
