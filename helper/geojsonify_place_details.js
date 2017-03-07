var _ = require('lodash');

// Properties to be copied
// If a property is identified as a single string, assume it should be presented as a string in response
// If something other than string is desired, use the following structure: { name: 'category', type: 'array' }
var DETAILS_PROPS = [
  { name: 'housenumber',       type: 'string' },
  { name: 'street',            type: 'string' },
  { name: 'postalcode',        type: 'string' },
  { name: 'postalcode_gid',    type: 'string' },
  { name: 'confidence',        type: 'default' },
  { name: 'match_type',        type: 'string' },
  { name: 'distance',          type: 'default' },
  { name: 'accuracy',          type: 'string' },
  { name: 'country',           type: 'string' },
  { name: 'country_gid',       type: 'string' },
  { name: 'country_a',         type: 'string' },
  { name: 'dependency',        type: 'string' },
  { name: 'dependency_gid',    type: 'string' },
  { name: 'dependency_a',      type: 'string' },
  { name: 'macroregion',       type: 'string' },
  { name: 'macroregion_gid',   type: 'string' },
  { name: 'macroregion_a',     type: 'string' },
  { name: 'region',            type: 'string' },
  { name: 'region_gid',        type: 'string' },
  { name: 'region_a',          type: 'string' },
  { name: 'macrocounty',       type: 'string' },
  { name: 'macrocounty_gid',   type: 'string' },
  { name: 'macrocounty_a',     type: 'string' },
  { name: 'county',            type: 'string' },
  { name: 'county_gid',        type: 'string' },
  { name: 'county_a',          type: 'string' },
  { name: 'localadmin',        type: 'string' },
  { name: 'localadmin_gid',    type: 'string' },
  { name: 'localadmin_a',      type: 'string' },
  { name: 'locality',          type: 'string' },
  { name: 'locality_gid',      type: 'string' },
  { name: 'locality_a',        type: 'string' },
  { name: 'borough',           type: 'string' },
  { name: 'borough_gid',       type: 'string' },
  { name: 'borough_a',         type: 'string' },
  { name: 'neighbourhood',     type: 'string' },
  { name: 'neighbourhood_gid', type: 'string' },
  { name: 'bounding_box',      type: 'default' },
  { name: 'label',             type: 'string' },
  { name: 'category',          type: 'array',     condition: checkCategoryParam }
];

function checkCategoryParam(params) {
  return _.isObject(params) && params.hasOwnProperty('categories');
}

/**
 * Add details properties
 *
 * @param {object} params clean query params
 * @param {object} src
 * @param {object} dst
 */
function addDetails(params, src, dst) {
  copyProperties(params, src, DETAILS_PROPS, dst);
}

/**
 * Copy specified properties from source to dest.
 * Ignore missing properties.
 *
 * @param {object} params clean query params
 * @param {object} source
 * @param {[]} props
 * @param {object} dst
 */
function copyProperties( params, source, props, dst ) {
  props.forEach( function ( prop ) {

    // if condition isn't met, just return without setting the property
    if (_.isFunction(prop.condition) && !prop.condition(params)) {
      return;
    }

    var property = {
      name: prop.name || prop,
      type: prop.type || 'default'
    };

    var value = null;
    if ( source.hasOwnProperty( property.name ) ) {

      switch (property.type) {
        case 'string':
          value = getStringValue(source[property.name]);
          break;
        case 'array':
          value = getArrayValue(source[property.name]);
          break;
        // default behavior is to copy property exactly as is
        default:
          value = source[property.name];
      }

      if (_.isNumber(value) || (value && !_.isEmpty(value))) {
        dst[property.name] = value;
      }
    }
  });
}

function getStringValue(property) {
  // isEmpty check works for all types of values: strings, arrays, objects
  if (_.isEmpty(property)) {
    return '';
  }

  if (_.isString(property)) {
    return property;
  }

  // array value, take first item in array (at this time only used for admin values)
  if (_.isArray(property)) {
    return property[0];
  }

  return _.toString(property);
}


function getArrayValue(property) {
  // isEmpty check works for all types of values: strings, arrays, objects
  if (_.isEmpty(property)) {
    return '';
  }

  if (_.isArray(property)) {
    return property;
  }

  return [property];
}

module.exports = addDetails;
