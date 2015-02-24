// validate inputs, convert types and apply defaults
function sanitize( req ){
  
  req.clean = req.clean || {};
  var params= req.query;
  var delim = ',';

  // ensure the input params are a valid object
  if( Object.prototype.toString.call( params ) !== '[object Object]' ){
    params = {};
  }

  // input text
  if('string' !== typeof params.input || !params.input.length){
    return { 
      'error': true,
      'message': 'invalid param \'input\': text length, must be >0'
    };
  }
  
  req.clean.input = params.input;

  // for admin matching during query time
  // split 'flatiron, new york, ny' into 'flatiron' and ' new york, ny'
  var delim_index = params.input.indexOf(delim);
  if ( delim_index !== -1 ) {
    req.clean.input = params.input.substring(0, delim_index);
    req.clean.input_admin = params.input.substring(delim_index + 1).trim();
  }

  return { 'error': false };

}

// export function
module.exports = sanitize;