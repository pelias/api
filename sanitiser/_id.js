// validate inputs, convert types and apply defaults
// id generally looks like 'geoname/4163334' (type/id)
// so, both type and id are required fields.

function sanitize( req ){
  
  req.clean   = req.clean || {};
  var params  = req.query;
  var indeces = require('../query/indeces');

  // ensure params is a valid object
  if( Object.prototype.toString.call( params ) !== '[object Object]' ){
    params = {};
  }

  var errormessage = function(fieldname, message) {
    return {
      'error': true,
      'message': message || ('invalid param \''+ fieldname + '\': text length, must be >0')
    }
  };

  // id text
  if('string' !== typeof params.id || !params.id.length){
    return errormessage('id');
  }

  // id format
  if(params.id.indexOf('/') === -1) {
    return errormessage('id', 'invalid: must be of the format type/id for ex: \'geoname/4163334\'');
  }
  req.clean.id = params.id;

  var param = params.id.split('/');
  var param_type  = param[0];
  var param_id    = param[1];

  // id text
  if('string' !== typeof param_id || !param_id.length){
    return errormessage('id');
  }

  // type text
  if('string' !== typeof param_type || !param_type.length){
    return errormessage('type');
  }

  // type text must be one of the indeces
  if(indeces.indexOf(param_type) == -1){
    return errormessage('type', 'type must be one of these values - [' + indeces.join(", ") + ']');
  }
  req.clean.id   = param_id;
  req.clean.type = param_type;

  return { 'error': false };

}

// export function
module.exports = sanitize;