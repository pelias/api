var isObject = require('is-object');
var isTruthy = require('./_truthy');

// validate inputs, convert types and apply defaults
function sanitize( req, default_value ){

  req.clean = req.clean || {};
  var params= req.query;

  if (default_value === undefined) {
    default_value = true;
  }

  default_value = !!default_value;

  // ensure the input params are a valid object
  if( !isObject( params ) ){
    params = {};
  }

  if (params.details === undefined) {
    req.clean.details = default_value;
  } else {
    req.clean.details = isTruthy(params.details);
  }

  return {'error':false};

}

module.exports = sanitize;
