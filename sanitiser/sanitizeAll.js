
var check = require('check-types');

function sanitize( req, sanitizers, cb ){

  // init an object to store clean
  // (sanitized) input parameters
  req.clean = {};

  // init erros and warnings arrays
  req.errors = [];
  req.warnings = [];

  // source of input parameters
  // (in this case from the GET querystring params)
  var params = req.query || {};

  for (var s in sanitizers) {
    var sanity = sanitizers[s]( params, req.clean );

    // if errors occurred then set them
    // on the req object.
    if( sanity.errors.length ){
      req.errors = req.errors.concat( sanity.errors );
    }

    // if warnings occurred then set them
    // on the req object.
    if( sanity.warnings.length ){
      req.warnings = req.warnings.concat( sanity.warnings );
    }
  }

  // @todo remove these args, they do not need to be passed out
  return cb( undefined, req.clean );
}

// export function
module.exports = sanitize;
