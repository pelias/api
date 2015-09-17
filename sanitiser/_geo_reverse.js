
var geo_common = require ('./_geo_common');
var LAT_LON_IS_REQUIRED = true,
    CIRCLE_IS_REQUIRED = false,
    CIRCLE_MUST_BE_COMPLETE = false;

// validate inputs, convert types and apply defaults
module.exports = function sanitize( raw, clean ){

  // error & warning messages
  var messages = { errors: [], warnings: [] };

  try {
    geo_common.sanitize_coord( 'point.lat', clean, raw['point.lat'], LAT_LON_IS_REQUIRED );
    geo_common.sanitize_coord( 'point.lon', clean, raw['point.lon'], LAT_LON_IS_REQUIRED );

    // remove both if only one is set
    // @todo: clean this up!
    if( !clean.hasOwnProperty('point.lat') || !clean.hasOwnProperty('point.lon') ){
      delete clean['point.lat'];
      delete clean['point.lon'];
    }

    // boundary.circle.* is not mandatory, and only specifying radius is fine,
    // as point.lat/lon will be used to fill those values by default
    geo_common.sanitize_boundary_circle( clean, raw, CIRCLE_IS_REQUIRED, CIRCLE_MUST_BE_COMPLETE);
  }
  catch (err) {
    messages.errors.push( err.message );
  }

  return messages;
};
