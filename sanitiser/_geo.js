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
 * bbox = bottom_left lat, bottom_left lon, top_right lat, top_right lon
 * bbox = left,bottom,right,top
 * bbox = min Longitude , min Latitude , max Longitude , max Latitude
 *
 * @param {object} clean
 * @param {string} param
 */
function sanitize_bbox( clean, param ) {
  if( !param ) {
    return;
  }

  var bbox = [];
  var bboxArr = param.split( ',' );

  if( Array.isArray( bboxArr ) && bboxArr.length === 4 ) {

    bbox = bboxArr.filter( function( latlon, index ) {
      latlon = parseFloat( latlon, 10 );
      return !(lat_lon_checks[(index % 2 === 0 ? 'lat' : 'lon')].is_invalid( latlon ));
    });

    if( bbox.length === 4 ) {
      clean.bbox = {
        right: Math.max( bbox[0], bbox[2] ),
        top: Math.max( bbox[1], bbox[3] ),
        left: Math.min( bbox[0], bbox[2] ),
        bottom: Math.min( bbox[1], bbox[3] )
      };
    } else {
      throw new Error('invalid bbox');
    }
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
  var value = parseFloat( param, 10 );
  if ( !isNaN( value ) ) {
    if( lat_lon_checks[coord].is_invalid( value ) ){
      throw new Error( 'invalid ' + lat_lon_checks[coord].error_msg );
    }
    clean[coord] = value;
  }
  else if (latlon_is_required) {
    throw new Error('missing ' + lat_lon_checks[coord].error_msg);
  }
}

function sanitize_zoom_level( clean, param ) {
  var zoom = parseInt( param, 10 );
  if( !isNaN( zoom ) ){
    clean.zoom = Math.min( Math.max( zoom, 1 ), 18 ); // max
  }
}

var lat_lon_checks = {
  lat: {
    is_invalid: function is_invalid_lat(lat) {
      return isNaN( lat ) || lat < -90 || lat > 90;
    },
    error_msg: 'param \'lat\': must be >-90 and <90'
  },
  lon: {
    is_invalid: function is_invalid_lon(lon) {
      return isNaN(lon) || lon < -180 || lon > 180;
    },
    error_msg: 'param \'lon\': must be >-180 and <180'
  }
};

