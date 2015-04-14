// validate inputs, convert types and apply defaults
function sanitize( req, default_value ){
  
  var clean = req.clean || {};
  var params= req.query;

  default_value = !!default_value;

  // ensure the input params are a valid object
  if( Object.prototype.toString.call( params ) !== '[object Object]' ){
    params = {};
  }

  clean.details = !!params.details;

  req.clean = clean;
  
  return {'error':false};

}

// export function
module.exports = sanitize;
