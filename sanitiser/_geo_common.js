/**
 * helper sanitiser methods for geo parameters
 */
var util = require('util'),
    check = require('check-types'),
    _ = require('lodash');

/**
 * Parse and validate rect parameter
 *
 * @param {string} key_prefix
 * @param {object} clean
 * @param {object} raw
 * @param {bool} bbox_is_required
 */
function sanitize_rect( key_prefix, clean, raw, bbox_is_required ) {

  // the names we use to define the corners of the rect
  var mandatoryProps = [ 'min_lat', 'max_lat', 'min_lon', 'max_lon' ];

  // count up how many fields the user actually specified
  var totalFieldsSpecified = 0;
  mandatoryProps.forEach( function( prop ){
    if( raw.hasOwnProperty( key_prefix + '.' + prop ) ){
      totalFieldsSpecified++;
    }
  });

  // all fields specified
  if( 4 === totalFieldsSpecified ) {
    // reuse the coord sanitizer and set required:true so we get a fatal error if
    // any one of the corners is not specified.
    sanitize_coord( key_prefix + '.min_lat', clean, raw[ key_prefix + '.min_lat' ], true );
    sanitize_coord( key_prefix + '.max_lat', clean, raw[ key_prefix + '.max_lat' ], true );
    sanitize_coord( key_prefix + '.min_lon', clean, raw[ key_prefix + '.min_lon' ], true );
    sanitize_coord( key_prefix + '.max_lon', clean, raw[ key_prefix + '.max_lon' ], true );
  }
  // fields only partially specified
  else if( totalFieldsSpecified > 0 ){
    var format1 = 'missing rect param \'%s\' requires all of: \'%s\' to be present';
    throw new Error( util.format( format1, key_prefix, mandatoryProps.join('\',\'') ) );
  }
  // fields required, eg. ( totalFieldsSpecified === 0 && bbox_is_required === true )
  else if( bbox_is_required ){
    var format2 = 'missing rect param \'%s\' requires all of: \'%s\' to be present';
    throw new Error( util.format( format2, key_prefix, mandatoryProps.join('\',\'') ) );
  }
}

/**
 * Parse and validate circle parameter
 *
 * @param {string} key_prefix
 * @param {object} clean
 * @param {object} raw
 * @param {bool} circle_is_required
 */
function sanitize_circle( key_prefix, clean, raw, circle_is_required ) {
  // "boundary.circle", clean, raw, false

  // the names we use to define the centroid
  var mandatoryProps = [ 'lat', 'lon' ];

  // count up how many fields the user actually specified
  var totalFieldsSpecified = 0;
  mandatoryProps.forEach( function( prop ){
    if( raw.hasOwnProperty( key_prefix + '.' + prop ) ){
      totalFieldsSpecified++;
    }
  });

  // all fields specified
  if( 2 === totalFieldsSpecified ) {
    // reuse the coord sanitizer and set required:true so we get a fatal error if
    // any one of the coords is not specified.
    sanitize_coord( key_prefix + '.lat', clean, raw[ key_prefix + '.lat' ], true );
    sanitize_coord( key_prefix + '.lon', clean, raw[ key_prefix + '.lon' ], true );

    if( check.assigned( raw[ key_prefix + '.radius' ] ) ){
      sanitize_coord( key_prefix + '.radius', clean, raw[ key_prefix + '.radius' ], true );
    }
  }
  // fields only partially specified
  else if( totalFieldsSpecified > 0 ){
    var format1 = 'missing circle param \'%s\' requires all of: \'%s\' to be present';
    throw new Error( util.format( format1, key_prefix, mandatoryProps.join('\',\'') ) );
  }
  // radius was specified without lat or lon
  else if( raw.hasOwnProperty( key_prefix + '.radius' ) ){
    var format2 = 'missing circle param \'%s\' requires all of: \'%s\' to be present';
    throw new Error( util.format( format2, key_prefix, mandatoryProps.join('\',\'') ) );
  }
  // fields required, eg. ( totalFieldsSpecified === 0 && bbox_is_required === true )
  else if( circle_is_required ){
    var format3 = 'missing circle param \'%s\' requires all of: \'%s\' to be present';
    throw new Error( util.format( format3, key_prefix, mandatoryProps.join('\',\'') ) );
  }
}

/**
 * Parse and validate point parameter
 *
 * @param {string} key_prefix
 * @param {object} clean
 * @param {object} raw
 * @param {bool} point_is_required
 */
function sanitize_point( key_prefix, clean, raw, point_is_required ) {

  // the names we use to define the point
  var mandatoryProps = [ 'lat', 'lon' ];

  // count up how many fields the user actually specified
  var totalFieldsSpecified = 0;
  mandatoryProps.forEach( function( prop ){
    if( raw.hasOwnProperty( key_prefix + '.' + prop ) ){
      totalFieldsSpecified++;
    }
  });

  // all fields specified
  if( 2 === totalFieldsSpecified ) {
    // reuse the coord sanitizer and set required:true so we get a fatal error if
    // any one of the coords is not specified.
    sanitize_coord( key_prefix + '.lat', clean, raw[ key_prefix + '.lat' ], true );
    sanitize_coord( key_prefix + '.lon', clean, raw[ key_prefix + '.lon' ], true );
  }
  // fields only partially specified
  else if( totalFieldsSpecified > 0 ){
    var format1 = 'missing point param \'%s\' requires all of: \'%s\' to be present';
    throw new Error( util.format( format1, key_prefix, mandatoryProps.join('\',\'') ) );
  }
  // fields required, eg. ( totalFieldsSpecified === 0 && bbox_is_required === true )
  else if( point_is_required ){
    var format2 = 'missing point param \'%s\' requires all of: \'%s\' to be present';
    throw new Error( util.format( format2, key_prefix, mandatoryProps.join('\',\'') ) );
  }
}

/**
 * Validate lat,lon values
 *
 * @param {string} key
 * @param {object} clean
 * @param {string} rawValue
 * @param {bool} latlon_is_required
 */
function sanitize_coord( key, clean, rawValue, latlon_is_required ) {
  var parsedValue = parseFloat( rawValue );
  if ( _.isFinite( parsedValue ) ) {
    clean[key] = parsedValue;
  }
  else if (latlon_is_required) {
    throw new Error( util.format( 'missing param \'%s\'', key ) );
  }
}

module.exports = {
  sanitize_rect: sanitize_rect,
  sanitize_coord: sanitize_coord,
  sanitize_circle: sanitize_circle,
  sanitize_point: sanitize_point
};
