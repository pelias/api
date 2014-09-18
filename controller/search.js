
function setup( backend, query ){

  // allow overriding of dependencies
  backend = backend || require('../src/backend');
  query = query || require('../query/search');

  function controller( req, res, next ){

    // backend command
    var cmd = {
      index: 'pelias',
      body: query( req.clean )
    };

    // query backend
    backend().client.search( cmd, function( err, data ){

      var docs = [];

      // handle backend errors
      if( err ){ return next( err ); }

      if( data && data.hits && data.hits.total){
        docs = data.hits.hits.map( function( hit ){
          return hit._source;
        });
      }

      // respond
      return res.status(200).json({
        date: new Date().getTime(),
        body: docs
      });
    });

  }

  return controller;
}

module.exports = setup;
