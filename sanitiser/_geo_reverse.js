
var geo_common = require ('./_geo_common');
var LAT_LON_IS_REQUIRED = true,
    CIRCLE_IS_REQUIRED = false,
    CIRCLE_MUST_BE_COMPLETE = false;

// validate inputs, convert types and apply defaults
module.exports = function sanitize( unclean, clean ){

  // error & warning messages
  var messages = { errors: [], warnings: [] };

  try {
    geo_common.sanitize_coord( 'lat', clean, unclean['point.lat'], LAT_LON_IS_REQUIRED );
    geo_common.sanitize_coord( 'lon', clean, unclean['point.lon'], LAT_LON_IS_REQUIRED );

    // boundary.circle.* is not mandatory, and only specifying radius is fine,
    // as point.lat/lon will be used to fill those values by default
    geo_common.sanitize_boundary_circle( clean, unclean, CIRCLE_IS_REQUIRED, CIRCLE_MUST_BE_COMPLETE);
  }
  catch (err) {
    messages.errors.push( err.message );
  }

  return messages;
};
