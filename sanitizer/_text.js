var check = require('check-types'),
  text_analyzer = require('pelias-text-analyzer');

// validate texts, convert types and apply defaults
function sanitize( raw, clean ){

  // error & warning messages
  var messages = { errors: [], warnings: [] };

  // invalid input 'text'
  // must call `!check.nonEmptyString` since `check.emptyString` returns
  //  `false` for `undefined` and `null`
  if( !check.nonEmptyString( raw.text ) ){
    messages.errors.push('invalid param \'text\': text length, must be >0');
  }

  // valid input 'text'
  else {
    // valid text
    clean.text = raw.text;

    // parse text with query parser
    var parsed_text = text_analyzer.parse(clean.text);
    if (check.assigned(parsed_text)) {
      clean.parsed_text = parsed_text;
    }
  }

  return messages;
}

// export function
module.exports = sanitize;
