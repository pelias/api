var isObject = require('is-object');
var truthy = require('./_truthy');

// validate inputs, convert types and apply defaults
function sanitize( req ){

  req.clean = req.clean || {};
  var params= req.query;

  // ensure the input params are a valid object
  if( !isObject( params ) ){
    params = {};
  }

  req.clean.private = truthy.isTruthyWithDefault(params.private, false);

  return {'error':false};

}

module.exports = sanitize;
