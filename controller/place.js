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

    /* req.clean.ids contains an array of objects with id and types properties.
     * types is an array of one or more types, since it can't always be known which single
     * type a gid might belong to (osmnode and osmway both have source osm and layer venue).
     *
     * However, the mget Elasticsearch query only accepts a single type at a
     * time.
     *
     * So, first create a new array that, has an entry
     * with each type and id combination. This requires creating a new array with more entries
     * than req.clean.ids in the case where entries have multiple types.
     */

    var recordsToReturn = req.clean.ids.reduce(function (acc, ids_element) {
      ids_element.types.forEach(function(type) {
        acc.push({
          id: ids_element.id,
          type: type
        });
      });
      return acc;
    }, []);

    /*
     * Next, map the list of records to an Elasticsearch mget query
     */
    var query = recordsToReturn.map( function(id) {
      return {
        _index: 'pelias',
        _type: id.type,
        _id: id.id
      };
    });

    service.mget( backend, query, function( err, docs ) {

      // error handler
      if( err ){
        req.errors.push( err );
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
