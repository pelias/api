
'use strict';

const _ = require('lodash');

var DEFAULT_FORCE_LIBPOSTAL = false;

// validate inputs, convert types and apply defaults
function sanitize( raw, clean ){

  // error & warning messages
  var messages = { errors: [], warnings: [] };

  clean.force_libpostal = isTruthy(_.get(raw, 'debug:force_libpostal', false));

  return messages;
}

// be lenient with 'truthy' values
function isTruthy(val) {
  if( _.isString( val ) ){
    return _.includes( ['true', '1', 'yes', 'y'], val );
  }

  return val === 1 || val === true;
}

// export function
module.exports = sanitize;
