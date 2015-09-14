
function sanitize( req, sanitizers, cb ){

  // init an object to store clean
  // (sanitized) input parameters
  req.clean = {};

  // source of input parameters
  // (in this case from the GET querystring params)
  var params = req.query || {};

  for (var s in sanitizers) {
    var sanity = sanitizers[s]( params, req.clean );

    // errors
    if( sanity.errors.length ){
      return cb( sanity.errors[0] );
    }
  }
  
  return cb( undefined, req.clean );

}

// export function
module.exports = sanitize;