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
        _type: id.layers,
        _id: id.id
      };
    });

    service.mget( backend, query, function( err, docs ) {
      console.log('err:' + err);

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
