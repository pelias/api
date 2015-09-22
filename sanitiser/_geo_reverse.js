
var geo_common = require ('./_geo_common');
var check = require('check-types');
var defaults = require('../query/defaults');
var LAT_LON_IS_REQUIRED = true,
    CIRCLE_IS_REQUIRED = false,
    CIRCLE_MUST_BE_COMPLETE = false;

// validate inputs, convert types and apply defaults
module.exports = function sanitize( raw, clean ){

  // error & warning messages
  var messages = { errors: [], warnings: [] };

  // helper function to determine if raw has a boundary.circle property
  var hasBoundaryCircleField = function(field) {
    return raw.hasOwnProperty('boundary.circle.' + field);
  };

  if (['lat', 'lon', 'radius'].some(hasBoundaryCircleField)) {
    messages.warnings.push('boundary.circle is currently unsupported and being ignored');
  }

  try {
    // first verify that point.lat/point.lon are valid
    geo_common.sanitize_point( 'point', clean, raw, LAT_LON_IS_REQUIRED );

    // overwrite boundary.circle.lat/lon with point.lat/lon
    raw['boundary.circle.lat'] = clean['point.lat'];
    raw['boundary.circle.lon'] = clean['point.lon'];

    // if no radius was passed, set the default
    if (!check.assigned(raw['boundary.circle.radius'])) {
      raw['boundary.circle.radius'] = defaults['boundary:circle:radius'];
    }

    // santize the boundary.circle
    geo_common.sanitize_circle( 'boundary.circle', clean, raw, CIRCLE_IS_REQUIRED );

  }
  catch (err) {
    messages.errors.push( err.message );
  }

  return messages;
};
