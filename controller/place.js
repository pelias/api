var service = { mget: require('../service/mget') };

function setup( backend ){

  // allow overriding of dependencies
  backend = backend || require('../src/backend');

  function controller( req, res, next ){

    // do not run controller when a request
    // validation error has occurred.
    if( req.errors && req.errors.length ){
      return next();
    }

    var query = req.clean.ids.map( function(id) {
      return {
        _index: 'pelias',
        /*
         * some gids aren't resolvable to a single type (ex: osmnode and osmway
         * both have source osm and layer venue), so expect an array of
         * possible values. It's important to use `type` here instead of
         * `_type`, as the former actually queries against the type, and thus
         * can accept multiple match values.  `_type`, on the other hand,
         * simply changes the actual URL of the query sent to Elasticsearch to
         * contain a type, which obviously can only take a single type.
         */
        type: id.types,
        _id: id.id
      };
    });

    service.mget( backend, query, function( err, docs ) {

      // error handler
      if( err ){
        req.errors.push( err.message ? err.message : err );
      }
      // set response data
      else {
        res.data = docs;
      }

      next();
    });
  }

  return controller;
}

module.exports = setup;
