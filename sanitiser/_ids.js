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
  console.log(params)

  var errormessage = function(fieldname, message) {
    return {
      'error': true,
      'message': message || ('invalid param \''+ fieldname + '\': text length, must be >0')
    }
  };

  if( params && params.ids && params.ids.length ){
    req.clean.ids = [];
    console.log(params.ids)
    params.ids.split(',').forEach( function(param) {
      param   = param.split('/');
      var type= param[0];
      var id  = param[1];
      console.log(param)
      // id text
      if('string' !== typeof id || !id.length){
        return errormessage('id');
      }
      // type text
      if('string' !== typeof type || !type.length){
        return errormessage('type');
      }
      // type text must be one of the indeces
      if(indeces.indexOf(type) == -1){
        return errormessage('type', 'type must be one of these values - [' + indeces.join(", ") + ']');
      }
      req.clean.ids.push({
        id: id,
        type: type
      });
    });
  }
  console.log(req.clean)
  return { 'error': false };

}

// export function
module.exports = sanitize;