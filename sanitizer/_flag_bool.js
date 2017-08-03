var _ = require('lodash');

/**
 * Returns sanitizer function for boolean flag parameters
 *
 * @param {string} paramName name of parameter being sanitized
 * @param {boolean} defaultValue value to set variable to if none specified
 * @returns {Object} object containing functions
 */
function _setup( paramName, defaultValue ) {
  /**
   * {object} opts
  */

  const opts = {
    paramName: paramName,
    defaultValue: defaultValue
  };

  return {
    /**
     * Validate inputs, convert types and apply defaults
     *
     * @param {object} raw
     * @param {object} clean
     * @returns {{errors: Array, warnings: Array}}
     */

    sanitize: function _sanitize( raw, clean){

      // error & warning messages`1
      var messages = { errors: [], warnings: [] };

      if( !_.isUndefined( raw[opts.paramName] ) ){
        clean[opts.paramName] = isTruthy( raw[opts.paramName] );
      }
      else {
        clean[opts.paramName] = opts.defaultValue;
      }
      return messages;
    }, // end of _sanitize function

    expected: function _expected(){
      return [{ name: opts.paramName}];
    } // end of _expected function
  }; // end of return object
} // end of _setup function

/**
 * Determine if param value is "truthy"
 * @param {*} val
 * @returns {boolean}
 */
function isTruthy(val) {
  return _.includes( ['true', '1', 1, true], val );
}

module.exports = _setup;
