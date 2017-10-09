'use strict';

const _ = require('lodash');

// Properties to be copied
// If a property is identified as a single string, assume it should be presented as a string in response
// If something other than string is desired, use the following structure: { name: 'category', type: 'array' }
const DETAILS_PROPS = [
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
  { name: 'continent',         type: 'string' },
  { name: 'continent_gid',     type: 'string' },
  { name: 'continent_a',       type: 'string' },
  { name: 'empire',            type: 'string',    condition: _.negate(hasCountry) },
  { name: 'empire_gid',        type: 'string',    condition: _.negate(hasCountry) },
  { name: 'empire_a',          type: 'string',    condition: _.negate(hasCountry) },
  { name: 'ocean',             type: 'string' },
  { name: 'ocean_gid',         type: 'string' },
  { name: 'ocean_a',           type: 'string' },
  { name: 'marinearea',        type: 'string' },
  { name: 'marinearea_gid',    type: 'string' },
  { name: 'marinearea_a',      type: 'string' },
  { name: 'bounding_box',      type: 'default' },
  { name: 'label',             type: 'string' },
  { name: 'category',          type: 'array',     condition: checkCategoryParam }
];

// returns true IFF source a country_gid property
function hasCountry(params, source) {
  return source.hasOwnProperty('country_gid');
}

function checkCategoryParam(params) {
  return _.isObject(params) && params.hasOwnProperty('categories');
}

/**
 * Collect the specified properties from source into an object and return it
 * Ignore missing properties.
 *
 * @param {object} params clean query params
 * @param {object} source
 * @param {object} dst
 */
function collectProperties( params, source ) {
  return DETAILS_PROPS.reduce((result, prop) => {
    // if condition isn't met, don't set the property
    if (_.isFunction(prop.condition) && !prop.condition(params, source)) {
      return result;
    }

    if ( source.hasOwnProperty( prop.name ) ) {
      let value = null;

      switch (prop.type) {
        case 'string':
          value = getStringValue(source[prop.name]);
          break;
        case 'array':
          value = getArrayValue(source[prop.name]);
          break;
        // default behavior is to copy property exactly as is
        default:
          value = source[prop.name];
      }

      if (_.isNumber(value) || (value && !_.isEmpty(value))) {
        result[prop.name] = value;
      }
    }

    return result;

  }, {});

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

module.exports = collectProperties;
