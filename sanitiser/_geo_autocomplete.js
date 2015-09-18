var geo_common = require ('./_geo_common');
var LAT_LON_IS_REQUIRED = false;

// validate inputs, convert types and apply defaults
module.exports = function sanitize( raw, clean ){

  // error & warning messages
  var messages = { errors: [], warnings: [] };

  try {
    geo_common.sanitize_point( 'focus.point', clean, raw, LAT_LON_IS_REQUIRED );
  }
  catch (err) {
    messages.errors.push( err.message );
  }

  return messages;
};
