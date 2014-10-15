// validate inputs, convert types and apply defaults
// id generally looks like 'geoname/4163334' (type/id)
// so, both type and id are required fields.

function sanitize( req ){
  
  req.clean = req.clean || {};
  var params= req.query;

  // ensure params is a valid object
  if( Object.prototype.toString.call( params ) !== '[object Object]' ){
    params = {};
  }

  var errormessage = function(fieldname) {
    return {
      'error': true,
      'message': 'invalid param \''+ fieldname + '\': text length, must be >0'
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

  return { 'error': false };

}

// export function
module.exports = sanitize;