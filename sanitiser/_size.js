var check = require('check-types');

var MIN_SIZE = 1,
    MAX_SIZE = 40,
    DEFAULT_SIZE = 10;

// validate inputs, convert types and apply defaults
function sanitize( raw, clean ){

  // error & warning messages
  var messages = { errors: [], warnings: [] };

  // coercions
  clean.size = parseInt( raw.size, 10 );

  // invalid numeric input
  if( isNaN( clean.size ) ){
    clean.size = DEFAULT_SIZE;
  }
  // ensure size falls within defined range
  else if( clean.size > MAX_SIZE ){
    // set the max size
    messages.warnings.push('out-of-range integer \'size\', using MAX_SIZE');
    clean.size = MAX_SIZE;
  }
  else if( clean.size < MIN_SIZE ){
    // set the min size
    messages.warnings.push('out-of-range integer \'size\', using MIN_SIZE');
    clean.size = MIN_SIZE;
  }

  return messages;
}

// export function
module.exports = sanitize;
