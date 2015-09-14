
var check = require('check-types'),
    query_parser = require('../helper/query_parser');

// validate texts, convert types and apply defaults
function sanitize( unclean, clean ){

  // error & warning messages
  var messages = { errors: [], warnings: [] };

  // invalid input 'text'
  if( !check.unemptyString( unclean.text ) ){
    messages.errors.push('invalid param \'text\': text length, must be >0');
  }

  // valid input 'text'
  else {

    // valid text
    clean.text = unclean.text;

    // parse text with query parser
    clean.parsed_text = query_parser.get_parsed_address(clean.text);

    // try to set layers from query parser results
    clean.types = clean.layers || {};
    clean.types.from_address_parsing = query_parser.get_layers(clean.text);
  }

  return messages;
}

// export function
module.exports = sanitize;
