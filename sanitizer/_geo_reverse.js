var geo_common = require ('./_geo_common');
var _ = require('lodash');
var defaults = require('../query/reverse_defaults');
var LAT_LON_IS_REQUIRED = true,
    CIRCLE_IS_REQUIRED = false;

const non_coarse_layers = ['venue', 'address', 'street'];

// validate inputs, convert types and apply defaults
function _sanitize( raw, clean ){

  // error & warning messages
  var messages = { errors: [], warnings: [] };

  // helper function to determine if raw has a boundary.circle property
  var hasBoundaryCircleField = function(field) {
    return raw.hasOwnProperty('boundary.circle.' + field);
  };

  if (['lat', 'lon'].some(hasBoundaryCircleField)) {
    messages.warnings.push('boundary.circle.lat/boundary.circle.lon are currently unsupported');
  }

  try {
    // first verify that point.lat/point.lon are valid
    geo_common.sanitize_point( 'point', clean, raw, LAT_LON_IS_REQUIRED );

    // overwrite boundary.circle.lat/lon with point.lat/lon
    raw['boundary.circle.lat'] = clean['point.lat'];
    raw['boundary.circle.lon'] = clean['point.lon'];

    // santize the boundary.circle
    geo_common.sanitize_circle( 'boundary.circle', clean, raw, CIRCLE_IS_REQUIRED );

  }
  catch (err) {
    messages.errors.push( err.message );
  }

  return messages;
}

function _expected(){
  return [
  { name: 'point.lat' },
  { name: 'point.lon' },
  { name: 'boundary.circle.lon' }, // copied from point.lon by the API, not user input
  { name: 'boundary.circle.lat' }, // copied from point.lat by the API, not user input
  { name: 'boundary.circle.radius'}];
}

module.exports = () => ({
  sanitize: _sanitize,
  expected: _expected
});
