var isObject = require('is-object');

// validate inputs, convert types and apply defaults
function sanitize( req, default_value ){
  
  var clean = req.clean || {};
  var params= req.query;

  if (default_value === undefined) {
    default_value = true;
  }
  
  default_value = !!default_value;

  // ensure the input params are a valid object
  if( !isObject( params ) ){
    params = {};
  }

  if (params.details !== undefined) {
    var details = params.details;

    if (typeof params.details === 'string') {
      details = params.details === 'true' ||
                params.details === '1' ||
                params.details === 'yes' ||
                params.details === 'y';
    }

    clean.details = details === true || details === 1;
  } else {
    clean.details = default_value;
  }

  req.clean = clean;
  
  return {'error':false};

}

// export function
module.exports = sanitize;
