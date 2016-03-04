var peliasLogger = require( 'pelias-logger' ).get( 'service/_searchCommon' );

function processResult( data ) {
  // map returned documents
  var docs = [];
  var meta = {
    scores: []
  };
  var error = null;


  // TODO Handle errors
  if( data ) {
    if( data.error ) {
      error = data.error;
    } else if( data.hits && data.hits.total && Array.isArray(data.hits.hits)){
      docs = data.hits.hits.map( function( hit ){

        meta.scores.push(hit._score);

        // map metadata in to _source so we
        // can serve it up to the consumer
        hit._source._id = hit._id;
        hit._source._type = hit._type;
        hit._source._score = hit._score;

        return hit._source;
      });
    }
  }

  return {
    docs: docs,
    meta: meta,
    error: error
  };
}

module.exports = {
  processResult: processResult
};
