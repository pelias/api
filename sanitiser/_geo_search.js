
var geo_common = require ('./_geo_common');
var LAT_LON_IS_REQUIRED = false;

// validate inputs, convert types and apply defaults
module.exports = function sanitize( unclean, clean ){

  // error & warning messages
  var messages = { errors: [], warnings: [] };

  try {
    geo_common.sanitize_coord( 'lat', clean, unclean['focus.point.lat'], LAT_LON_IS_REQUIRED );
    geo_common.sanitize_coord( 'lon', clean, unclean['focus.point.lon'], LAT_LON_IS_REQUIRED );
    geo_common.sanitize_bbox(unclean, clean);
  }
  catch (err) {
    messages.errors.push( err.message );
  }

  return messages;
};
