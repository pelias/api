/**
 * helper sanitizer methods for geo parameters
 */
var groups = require('./_groups'),
    check = require('check-types'),
    wrap = require('./wrap'),
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
  // calculate full property names from the key_prefix
  var properties = [ 'min_lat', 'max_lat', 'min_lon', 'max_lon' ].map(function(prop) {
    return key_prefix + '.' + prop;
  });

  // sanitize the rect property group, this throws an exception if
  // the group is not complete
  var bbox_present;
  if (bbox_is_required) {
    bbox_present = groups.required(raw, properties);
  } else {
    bbox_present = groups.optional(raw, properties);
  }

  // don't bother checking individual elements if bbox is not required
  // and not present
  if (!bbox_present) { return; }

  sanitize_bbox_min_max(raw, key_prefix);
  sanitize_bbox_bounds(raw, key_prefix);

  // use sanitize_coord to set values in `clean`
  properties.forEach(function(prop) {
    sanitize_coord(prop, clean, raw, true);
  });
}

  // validate max is greater than min for lat and lon
function sanitize_bbox_min_max(raw, key_prefix) {
  ['lat', 'lon'].forEach(function(dimension) {
    const max = parseFloat(raw[`${key_prefix}.max_${dimension}`]);
    const min = parseFloat(raw[`${key_prefix}.min_${dimension}`]);

    if (max < min) {
      throw new Error(`min_${dimension} is larger than max_${dimension} in ${key_prefix}`);
    }
  });
}

// validate lat/lon values are within bounds
function sanitize_bbox_bounds(raw, key_prefix) {
  const bounds = [ { dimension: 'lat', range: 90},
                   { dimension: 'lon', range: 180}];

  bounds.forEach(function(bound) {
    const values = {
      max: parseFloat(raw[`${key_prefix}.max_${bound.dimension}`]),
      min: parseFloat(raw[`${key_prefix}.min_${bound.dimension}`])
    };

    ['min', 'max'].forEach(function(prefix) {
      if (Math.abs(values[prefix]) > bound.range) {
        const key =`${key_prefix}.${prefix}_${bound.dimension}`;
        throw new Error(`${key} value ${values[prefix]} is outside range -${bound.range},${bound.range}`);
      }
    });
  });
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
  // sanitize both a point and a radius if radius is present
  // otherwise just sanittize the point
  if( check.assigned( raw[ key_prefix + '.radius' ] ) ){
    sanitize_coord( key_prefix + '.radius', clean, raw, true );
    sanitize_point( key_prefix, clean, raw, true);
  } else {
    sanitize_point( key_prefix, clean, raw, circle_is_required);
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

  // calculate full property names from the key_prefix
  var properties = [ 'lat', 'lon'].map(function(prop) {
    return key_prefix + '.' + prop;
  });

  // sanitize the rect property group, this throws an exception if
  // the group is not complete
  var point_present;
  if (point_is_required) {
    point_present = groups.required(raw, properties);
  } else {
    point_present = groups.optional(raw, properties);
  }

  // don't bother checking individual elements if point is not required
  // and not present
  if (!point_present) { return; }

  // check each property individually. now that it is known a bbox is present,
  // all properties must exist, so pass the true flag for coord_is_required
  properties.forEach(function(prop) {
    sanitize_coord(prop, clean, raw, true);
  });

  // normalize co-ordinates by wrapping around the poles
  var normalized = wrap(clean[properties[0]], clean[properties[1]]);
  clean[properties[0]] = normalized.lat;
  clean[properties[1]] = normalized.lon;
}

/**
 * Validate lat,lon values
 *
 * @param {string} key - which key to validate
 * @param {object} clean - cleaned parameters object
 * @param {object} raw - the raw request object
 * @param {bool} latlon_is_required
 */
function sanitize_coord( key, clean, raw, latlon_is_required ) {
  var parsedValue = parseFloat( raw[key] );

  if ( _.isFinite( parsedValue ) ) {
    clean[key] = parsedValue;
  }
  else if (latlon_is_required) {
    throw new Error(`missing param '${key}'`);
  }
}

module.exports = {
  sanitize_rect: sanitize_rect,
  sanitize_coord: sanitize_coord,
  sanitize_circle: sanitize_circle,
  sanitize_point: sanitize_point
};
