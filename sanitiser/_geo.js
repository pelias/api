var util = require( 'util' );
var isObject = require('is-object');


// validate inputs, convert types and apply defaults
module.exports = function sanitize( req, latlon_is_required ){

  var clean = req.clean || {};
  var params = req.query;
  latlon_is_required = latlon_is_required || false;

  // ensure the input params are a valid object
  if( !isObject( params ) ){
    params = {};
  }

  try {
    sanitize_coord( 'lat', clean, params.lat, latlon_is_required );
    sanitize_coord( 'lon', clean, params.lon, latlon_is_required );
    sanitize_zoom_level(clean, params.zoom);
    sanitize_bbox(clean, params.bbox);
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


/**
 * Parse and validate bbox parameter
 * bbox = bottom_left lon, bottom_left lat, top_right lon, top_right lat
 * bbox = left, bottom, right, top
 * bbox = min Longitude, min Latitude, max Longitude, max Latitude
 *
 * @param {object} clean
 * @param {string} param
 */
function sanitize_bbox( clean, param ) {
  if( !param ) {
    return;
  }

  var bboxArr = param.split( ',' );

  if( Array.isArray( bboxArr ) && bboxArr.length === 4 ) {

    var bbox = [];
    for( var ind = 0; ind < bboxArr.length; ind++ ){
      var num = parseFloat( bboxArr[ ind ] );
      if( isNaN( num ) ){
        return;
      }
      if( ind % 2 === 1 && check_lat.is_invalid( num ) ){
        throw new Error( 'Invalid lat: ' + num );
      }
      bbox.push( num );
    }

    clean.bbox = {
      right: Math.max( bbox[0], bbox[2] ),
      top: Math.max( bbox[1], bbox[3] ),
      left: Math.min( bbox[0], bbox[2] ),
      bottom: Math.min( bbox[1], bbox[3] )
    };
  }
}

/**
 * Validate lat,lon values
 *
 * @param {string} coord lat|lon
 * @param {object} clean
 * @param {string} param
 * @param {bool} latlon_is_required
 */
function sanitize_coord( coord, clean, param, latlon_is_required ) {
  var value = parseFloat( param );
  if ( !isNaN( value ) ) {
    if( coord === 'lat' && check_lat.is_invalid( value ) ){
      throw new Error( 'invalid ' + check_lat.error_msg );
    }
    clean[coord] = value;
  }
  else if (latlon_is_required) {
    throw new Error( util.format( 'missing param \'%s\'', coord ) );
  }
}

function sanitize_zoom_level( clean, param ) {
  var zoom = parseInt( param, 10 );
  if( !isNaN( zoom ) ){
    clean.zoom = Math.min( Math.max( zoom, 1 ), 18 ); // max
  }
}

var check_lat = {
  is_invalid: function is_invalid_lat( lat ){
    return isNaN( lat ) || lat < -90 || lat > 90;
  },
  error_msg: 'param \'lat\': must be >-90 and <90'
};
