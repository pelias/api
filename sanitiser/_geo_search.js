var check = require('check-types');
var geo_common = require ('./_geo_common');
var LAT_LON_IS_REQUIRED = false;
var RECT_IS_REQUIRED = false;
var CIRCLE_IS_REQUIRED = false;
var VIEWPORT_IS_REQUIRED = false;

// validate inputs, convert types and apply defaults
module.exports = function sanitize( raw, clean ){

  // error & warning messages
  var messages = { errors: [], warnings: [] };

  // disallow specifying both focus.point and focus.viewport
  if ( ( raw['focus.viewport.min_lat'] ||
         raw['focus.viewport.max_lat'] ||
         raw['focus.viewport.min_lon'] ||
         raw['focus.viewport.max_lon'] )  &&
       ( raw['focus.point.lat'] ||
         raw['focus.point.lon'] ) ) {
    messages.errors.push( 'focus.point and focus.viewport can\'t both be set' );
    return messages;
  }

  try {
    geo_common.sanitize_point( 'focus.point', clean, raw, LAT_LON_IS_REQUIRED );
    geo_common.sanitize_rect( 'boundary.rect', clean, raw, RECT_IS_REQUIRED );
    geo_common.sanitize_circle( 'boundary.circle', clean, raw, CIRCLE_IS_REQUIRED );
    geo_common.sanitize_rect( 'focus.viewport', clean, raw, VIEWPORT_IS_REQUIRED );
  }
  catch (err) {
    messages.errors.push( err.message );
  }

  return messages;
};
