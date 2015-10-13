var check = require('check-types'),
    text_parser = require('../helper/text_parser');

// validate texts, convert types and apply defaults
function sanitize( raw, clean ){

  // error & warning messages
  var messages = { errors: [], warnings: [] };

  // invalid input 'text'
  if( !check.unemptyString( raw.text ) ){
    messages.errors.push('invalid param \'text\': text length, must be >0');
  }

  // valid input 'text'
  else {

    // valid text
    clean.text = raw.text;

    // parse text with query parser
    var parsed_text = text_parser.get_parsed_address(clean.text);
    if (check.assigned(parsed_text)) {
      clean.parsed_text = parsed_text;
    }

    // try to set layers from query parser results
    clean.types = clean.layers || {};
    clean.types.from_address_parsing = text_parser.get_layers(clean.text);
  }

  return messages;
}

// export function
module.exports = sanitize;
