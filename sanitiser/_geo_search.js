var geo_common = require ('./_geo_common');
var LAT_LON_IS_REQUIRED = false;

// validate inputs, convert types and apply defaults
module.exports = function sanitize( raw, clean ){

  // error & warning messages
  var messages = { errors: [], warnings: [] };

  try {
    geo_common.sanitize_coord( 'focus.point.lat', clean, raw['focus.point.lat'], LAT_LON_IS_REQUIRED );
    geo_common.sanitize_coord( 'focus.point.lon', clean, raw['focus.point.lon'], LAT_LON_IS_REQUIRED );
    geo_common.sanitize_bbox(raw, clean);
  }
  catch (err) {
    messages.errors.push( err.message );
  }

  return messages;
};
