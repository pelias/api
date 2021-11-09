const _ = require('lodash');

// validate inputs
function _sanitize(raw, clean) {
  // error & warning messages
  var messages = { errors: [], warnings: [] };

  Object.keys(raw).forEach((key) => {
    if (_.isArray(raw[key])) {
      messages.errors.push("'" + key + "' parameter can only have one value");
      delete raw[key];
    } else if (_.isObject(raw[key])) {
      messages.errors.push("'" + key + "' parameter must be a scalar");
      delete raw[key];
    }
  });

  return messages;
}

// export function
module.exports = () => ({
  sanitize: _sanitize,
});
