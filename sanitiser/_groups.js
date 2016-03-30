var _ = require('lodash');

/*
 * Specify an object and array of keys to check.
 * An error will be thrown if at least one, but not all of them are specified
 *
 * @param {object} - the object
 * @param {array} - keys to check
 *
 * returns true if all are present, false if none are present, throws an exception otherwise
 */
function optional_group(object, keys) {
  var contained_in_object = _.includes.bind(null, Object.keys(object));

  if (keys.every(contained_in_object)) {
    return true;
  } else if (!keys.some(contained_in_object)) {
    return false;
  } else {
    throw new Error(error_message(keys));
  }
}

/*
 * Specify an object and array of keys to check.
 * An error will be thrown if any of the keys are missing from the object
 */
function required_group(object, keys) {
  var contained_in_object = _.includes.bind(null, Object.keys(object));

  if (keys.every(contained_in_object)) {
    return true;
  } else {
    throw new Error(error_message(keys));
  }
}

/*
 * Create a friendly error message from a list of keys
 */
function error_message(keys) {
  var start = 'parameters ';

  var listStart = keys.slice(0, -1).join(', ');
  var listEnd = ' and ' + keys[keys.length - 1];

  var adjective = (keys.length > 2) ? 'all' : 'both';

  var end = ' must ' + adjective + ' be specified';

  return start + listStart + listEnd + end;
}

module.exports = {
  optional: optional_group,
  required: required_group
};
