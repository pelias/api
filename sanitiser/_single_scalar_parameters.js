
var _ = require('lodash'),
    check = require('check-types');

// validate inputs
function sanitize( raw, clean ){
  // error & warning messages
  var messages = { errors: [], warnings: [] };

  Object.keys(raw).forEach(function(key) {
    if (_.isArray(raw[key])) {
      messages.errors.push('\'' + key + '\' parameter can only have one value');
    } else if (_.isObject(raw[key])) {
      messages.errors.push('\'' + key + '\' parameter must be a scalar');
    }

  });

  return messages;
}

// export function
module.exports = sanitize;
