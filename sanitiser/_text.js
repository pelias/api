var isObject     = require('is-object');
var query_parser = require('../helper/query_parser');

// validate inputs, convert types and apply defaults
function sanitize( req ){
  req.clean = req.clean || {};
  var params= req.query;

  // ensure the input params are a valid object
  if( !isObject( params ) ){
    params = {};
  }

  if('string' !== typeof params.text || !params.text.length){
    return {
      'error': true,
      'message': 'invalid param \'text\': text length, must be >0'
    };
  }

  req.clean.text = params.text;

  req.clean.parsed_text = query_parser.get_parsed_address(params.text);

  req.clean.types = req.clean.layers || {};
  req.clean.types.from_address_parsing = query_parser.get_layers(params.text);

  return { 'error': false };
}

// export function
module.exports = sanitize;
