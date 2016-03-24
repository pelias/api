var _ = require('lodash');

/**
 * Returns sanitizer function for boolean flag parameters
 *
 * @param {string} paramName name of parameter being sanitized
 * @param {boolean} defaultValue value to set variable to if none specified
 * @returns {Function}
 */
function setup( paramName, defaultValue ) {
  return function( raw, clean ){
    return sanitize( raw, clean, {
      paramName: paramName,
      defaultValue: defaultValue
    });
  };
}

/**
 * Validate inputs, convert types and apply defaults
 *
 * @param {object} raw
 * @param {object} clean
 * @param {object} opts
 * @returns {{errors: Array, warnings: Array}}
 */
function sanitize( raw, clean, opts ){

  // error & warning messages`1
  var messages = { errors: [], warnings: [] };

  if( !_.isUndefined( raw[opts.paramName] ) ){
    clean[opts.paramName] = isTruthy( raw[opts.paramName] );
  }
  else {
    clean[opts.paramName] = opts.defaultValue;
  }
  return messages;
}

/**
 * Determine if param value is "truthy"
 * @param {*} val
 * @returns {boolean}
 */
function isTruthy(val) {
  return _.includes( ['true', '1', 1, true], val );
}

module.exports = setup;
