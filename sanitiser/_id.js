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
  req.clean.id = params.id;

  // type text
  if('string' !== typeof params.type || !params.type.length){
    return errormessage('type');
  }
  req.clean.type = params.type;

  // type text must be one of the indeces
  if(indeces.indexOf(params.type) == -1){
    return errormessage('type', 'type must be one of these values - [' + indeces.join(", ") + ']');
  }
  req.clean.type = params.type;

  return { 'error': false };

}

// export function
module.exports = sanitize;