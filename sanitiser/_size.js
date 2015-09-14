
var MIN_SIZE = 1,
    MAX_SIZE = 40,
    DEFAULT_SIZE = 10;

// validate inputs, convert types and apply defaults
function sanitize( raw, clean ){

  // error & warning messages
  var messages = { errors: [], warnings: [] };

  // coercions
  var _size = parseInt( raw.size, 10 );

  // invalid numeric input
  // @todo: this can be removed now as queries have default sizes?
  if( isNaN( _size ) ){

    // set the default size
    messages.warnings.push('invalid integer \'size\', using DEFAULT_SIZE');
    clean.size = DEFAULT_SIZE;
  }
  // valid numeric input
  else {

    // ensure size falls within defined range
    if( _size > MAX_SIZE ){
      // set the max size
      messages.warnings.push('out-of-range integer \'size\', using MAX_SIZE');
      clean.size = MAX_SIZE;
    }
    else if( _size < MIN_SIZE ){
      // set the min size
      messages.warnings.push('out-of-range integer \'size\', using MIN_SIZE');
      clean.size = MIN_SIZE;
    }
    else {
      // set the input size
      clean.size = _size;
    }

  }

  return messages;
}

// export function
module.exports = sanitize;
