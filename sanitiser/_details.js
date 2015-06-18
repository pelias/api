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
    clean.details = isTruthy(params.details);
  } else {
    clean.details = default_value;
  }

  req.clean = clean;
  
  return {'error':false};

}

function isTruthy(val) {
  if (typeof val === 'string') {
    return ['true', '1', 'yes', 'y'].indexOf(val) !== -1;
  }

  return val === 1 || val === true;
}

// export function
module.exports = sanitize;
