var isObject = require('is-object');

// validate inputs, convert types and apply defaults
// id generally looks like 'geoname:4163334' (type:id)
// so, both type and id are required fields.

function sanitize( req ){
  req.clean   = req.clean || {};
  var params  = req.query;
  var types = require('../query/types');
  var delim   = ':';

  // ensure params is a valid object
  if( !isObject( params ) ){
    params = {};
  }

  var errormessage = function(fieldname, message) {
    return {
      'error': true,
      'message': message || ('invalid param \''+ fieldname + '\': text length, must be >0')
    };
  };

  if(('string' === typeof params.id && !params.id.length) || params.id === undefined){
    return errormessage('id');
  }

  if( params && params.id && params.id.length ){
    req.clean.ids = [];
    params.ids = Array.isArray(params.id) ? params.id : [params.id];

    // de-dupe
    params.ids = params.ids.filter(function(item, pos) {
      return params.ids.indexOf(item) === pos;
    });

    for (var i=0; i<params.ids.length; i++) {
      var thisparam = params.ids[i];

      // basic format/ presence of ':'
      if(thisparam.indexOf(delim) === -1) {
        return errormessage(null, 'invalid: must be of the format type:id for ex: \'geoname:4163334\'');
      }

      var param_index = thisparam.indexOf(delim);
      var type = thisparam.substring(0, param_index );
      var id   = thisparam.substring(param_index + 1);

      // id text
      if('string' !== typeof id || !id.length){
        return errormessage(thisparam);
      }
      // type text
      if('string' !== typeof type || !type.length){
        return errormessage(thisparam);
      }
      // type text must be one of the types
      if(types.indexOf(type) === -1){
        return errormessage('type', type + ' is invalid. It must be one of these values - [' + types.join(', ') + ']');
      }
      req.clean.ids.push({
        id: id,
        type: type
      });
    }
  }

  return { 'error': false };
}

// export function
module.exports = sanitize;
