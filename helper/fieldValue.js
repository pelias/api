const _ = require('lodash');

function getStringValue(property) {
  // numeric value, cast to string
  if (_.isNumber(property)) {
    return _.toString(property);
  }

  // isEmpty check works for all types of values: strings, arrays, objects
  if (_.isEmpty(property)) {
    return '';
  }

  if (_.isString(property)) {
    return property;
  }

  // array value, take first item in array (at this time only used for admin & name values)
  if (_.isArray(property)) {
    return property[0];
  }

  return _.toString(property);
}

function getArrayValue(property) {
  // numeric value, cast to array
  if (_.isNumber(property)) {
    return [property];
  }

  // isEmpty check works for all types of values: strings, arrays, objects
  if (_.isEmpty(property)) {
    return [];
  }

  if (_.isArray(property)) {
    return property;
  }

  return [property];
}

module.exports.getStringValue = getStringValue;
module.exports.getArrayValue = getArrayValue;
