var isObject   = require('is-object');
var query_parse= require('../helper/query_parser');

// validate inputs, convert types and apply defaults
function sanitize( req ){
  
  req.clean = req.clean || {};
  var params= req.query;
  
  // ensure the input params are a valid object
  if( !isObject( params ) ){
    params = {};
  }

  // input text
  if('string' !== typeof params.text || !params.text.length){
    return { 
      'error': true,
      'message': 'invalid param \'text\': text length, must be >0'
    };
  }
  
  req.clean.text = params.text;

  req.clean.parsed_text = query_parse(params.text);


  return { 'error': false };

}

// export function
module.exports = sanitize;