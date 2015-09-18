
var geo_common = require ('./_geo_common');
var LAT_LON_IS_REQUIRED = true,
    CIRCLE_IS_REQUIRED = false,
    CIRCLE_MUST_BE_COMPLETE = false;

// validate inputs, convert types and apply defaults
module.exports = function sanitize( raw, clean ){

  // error & warning messages
  var messages = { errors: [], warnings: [] };

  try {
    geo_common.sanitize_point( 'point', clean, raw, LAT_LON_IS_REQUIRED );

    // this hack is to allow point.lat/point.lon to be used interchanagbly
    // with boundary.circle.lat/boundary.circle/lon
    if( !clean.hasOwnProperty('boundary.circle.lat') && clean.hasOwnProperty('point.lat') ){
      raw['boundary.circle.lat'] = clean['point.lat'];
    }
    if( !clean.hasOwnProperty('boundary.circle.lon') && clean.hasOwnProperty('point.lon') ){
      raw['boundary.circle.lon'] = clean['point.lon'];
    }

    geo_common.sanitize_circle( 'boundary.circle', clean, raw, CIRCLE_IS_REQUIRED );
  }
  catch (err) {
    messages.errors.push( err.message );
  }

  return messages;
};
