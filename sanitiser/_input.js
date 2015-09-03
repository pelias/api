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
  if('string' !== typeof params.input || !params.input.length){
    return {
      'error': true,
      'message': 'invalid param \'input\': text length, must be >0'
    };
  }

  req.clean.input = params.input;

  req.clean.parsed_input = query_parse(params.input);

  return { 'error': false };
}

// export function
module.exports = sanitize;
