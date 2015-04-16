// validate inputs, convert types and apply defaults
function sanitize( req, default_value ){
  
  var clean = req.clean || {};
  var params= req.query;

  if (default_value === undefined) {
    default_value = true;
  }
  
  default_value = !!default_value;

  // ensure the input params are a valid object
  if( Object.prototype.toString.call( params ) !== '[object Object]' ){
    params = {};
  }

  if (params.details !== undefined) {
    var details = typeof params.details === 'string' ? params.details === 'true' : params.details;
    clean.details = details === true || details === 1;  
  } else {
    clean.details = default_value;
  }

  req.clean = clean;
  
  return {'error':false};

}

// export function
module.exports = sanitize;
