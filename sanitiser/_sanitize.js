function sanitize( req, sanitiser, cb ){

  req.clean = req.clean || {};

  for (var s in sanitiser) { 
    var sanity = sanitiser[s](req);
    if (sanity.error) {
      return cb(sanity.message);
    }
  }
  
  return cb( undefined, req.clean );

}

// export function
module.exports = sanitize;