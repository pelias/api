var isObject = require('is-object');
var geo_common = require ('./_geo_common');

// validate inputs, convert types and apply defaults
module.exports = function sanitize( req ){
  var clean = req.clean || {};
  var params = req.query;
  var latlon_is_required = true;
  var circle_is_required = false;
  var circle_must_be_complete = false;

  // ensure the input params are a valid object
  if( !isObject( params ) ){
    params = {};
  }

  if( !isObject( params.point ) ){
    params.point = {};
  }

  try {
    geo_common.sanitize_coord( 'lat', clean, params['point.lat'], latlon_is_required );
    geo_common.sanitize_coord( 'lon', clean, params['point.lon'], latlon_is_required );

    // boundary.circle.* is not mandatory, and only specifying radius is fine,
    // as point.lat/lon will be used to fill those values by default
    geo_common.sanitize_boundary_circle( clean, params, circle_is_required, circle_must_be_complete);
  }
  catch (err) {
    return {
      'error': true,
      'message': err.message
    };
  }

  req.clean = clean;

  return { 'error': false };
};
