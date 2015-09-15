/**
 * helper sanitiser methods for geo parameters
 */
var util = require('util'),
    check = require('check-types');

/**
 * Parse and validate bbox parameter
 * bbox = bottom_left lon, bottom_left lat, top_right lon, top_right lat
 * bbox = left, bottom, right, top
 * bbox = min Longitude, min Latitude, max Longitude, max Latitude
 *
 * @param {object} raw
 * @param {object} clean
 */
function sanitize_bbox( raw, clean ) {
  if( !check.unemptyString( raw.bbox ) ) {
    return;
  }

  var bboxArr = raw.bbox.split( ',' );

  if( Array.isArray( bboxArr ) && bboxArr.length === 4 ) {
    var bbox = bboxArr.map(parseFloat);

    if (bbox.some(isNaN)) {
      return;
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
    clean[coord] = value;
  }
  else if (latlon_is_required) {
    throw new Error( util.format( 'missing param \'%s\'', coord ) );
  }
}

/**
 * Validate circle geometry values
 *
 * @param {object} clean
 * @param {object} params
 * @param {bool} is_required
 * @param {bool} all_required
 */
function sanitize_boundary_circle( clean, params, is_required, all_required ) {
  var props = {
    lat: 'boundary_circle_lat',
    lon: 'boundary_circle_lon',
    rad: 'boundary_circle_radius'
  };

  // get values for each property
  sanitize_coord(props.lat, clean, params['boundary.circle.lat'], all_required && is_required);
  sanitize_coord(props.lon, clean, params['boundary.circle.lon'], all_required && is_required);
  sanitize_coord(props.rad, clean, params['boundary.circle.radius'], all_required && is_required);

  // if all are required, check if some are set but not all, throw an error if missing
  if (all_required &&
     (clean.hasOwnProperty(props.lat) || clean.hasOwnProperty(props.lon) || clean.hasOwnProperty(props.rad)) &&
    !(clean.hasOwnProperty(props.lat) && clean.hasOwnProperty(props.lon) && clean.hasOwnProperty(props.rad))) {
    throw new Error('missing part of circle: needs lat,lon,radius');
  }

  if (is_required && !(clean.hasOwnProperty(props.lat) || clean.hasOwnProperty(props.lon) || clean.hasOwnProperty(props.rad))) {
    throw new Error('missing param boundary.circle: should be a trio of lat,lon,radius');
  }
}

module.exports = {
  sanitize_bbox: sanitize_bbox,
  sanitize_coord: sanitize_coord,
  sanitize_boundary_circle: sanitize_boundary_circle
};
