var check = require('check-types');

// validate inputs, convert types and apply defaults
function sanitize( raw, clean ){

  // error & warning messages
  var messages = { errors: [], warnings: [] };

  // valid input 'lang'
  if(check.nonEmptyString( raw.lang )) {
    clean.lang = raw.lang;
  }

  return messages;
}

// export function
module.exports = sanitize;
