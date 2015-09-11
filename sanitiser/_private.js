var isObject = require('is-object');
var isTruthy = require('./_truthy');

// validate inputs, convert types and apply defaults
function sanitize( req, default_value ){

  req.clean = req.clean || {};
  var params= req.query;

  if (typeof default_value === 'undefined') {
    default_value = true;
  }

  // cast default_value to boolean in the case where it's defined
  default_value = !!default_value;

  // ensure the input params are a valid object
  if( !isObject( params ) ){
    params = {};
  }

  if (params.hasOwnProperty('private')) {
    req.clean.private = isTruthy(params.private);
  }
  else {
    req.clean.private = default_value;
  }

  return {'error':false};

}

module.exports = sanitize;
