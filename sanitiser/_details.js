
var check = require('check-types');
var DEFAULT_DETAILS_BOOL = true;

// validate inputs, convert types and apply defaults
function sanitize( unclean, clean ){

  // error & warning messages
  var messages = { errors: [], warnings: [] };

  if( !check.undefined( unclean.details ) ){
    clean.details = isTruthy( unclean.details );
  } else {
    clean.details = DEFAULT_DETAILS_BOOL;
  }

  return messages;
}

// be lenient with 'truthy' values
function isTruthy(val) {
  if( check.string( val ) ){
    return ['true', '1', 'yes', 'y'].indexOf(val) !== -1;
  }

  return val === 1 || val === true;
}

// export function
module.exports = sanitize;
