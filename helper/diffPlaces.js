var _ = require('lodash');
var placeTypes = require('./placeTypes');
var geolib = require('geolib');
var minDistance = 200; // meters

var api = require('pelias-config').generate().api;
if (api && api.dedupeDistanceThreshold) {
  minDistance = api.dedupeDistanceThreshold;
}

/**
 * Compare the layer properties if they exist.
 * Returns false if the objects are the same, and throws
 * an exception with the message 'different' if not.
 *
 * @param {object} item1
 * @param {object} item2
 * @returns {boolean}
 * @throws {Error}
 */
function assertLayerMatch(item1, item2) {
  if (item1.layer === item2.layer) {
    return false;
  }

  throw new Error('different');
}

/**
 * Compare the parent.*_id properties if they exist.
 * Returns false if the objects are the same, and throws
 * an exception with the message 'different' if not.
 *
 * @param {object} item1
 * @param {object} item2
 * @returns {boolean}
 * @throws {Error}
 */
function assertParentHierarchyMatch(item1, item2) {
  // if neither object has parent, assume same
  if (!item1.hasOwnProperty('parent') && !item2.hasOwnProperty('parent')) {
    return false;
  }

  // if both have parent, do the rest of the checking
  if (item1.hasOwnProperty('parent') && item2.hasOwnProperty('parent')) {
    placeTypes.forEach(function (placeType) {
      // don't consider its own id
      if (placeType === item1.layer) {
        return;
      }
      propMatch(item1.parent, item2.parent, placeType + '_id');
    });
    return false;
  }

  // if one has parent and the other doesn't consider different
  throw new Error('different');
}

/**
 * Compare the name.* properties if they exist.
 * Returns false if the objects are the same, and throws
 * an exception with the message 'different' if not.
 *
 * @param {object} item1
 * @param {object} item2
 * @returns {boolean}
 * @throws {Error}
 */
function assertNameMatch(item1, item2) {
  if (item1.hasOwnProperty('name') && item2.hasOwnProperty('name')) {
    for (var lang in item1.name) {
      if(item2.name.hasOwnProperty(lang) || lang === 'default') {
        // do not consider absence of an additional name as a difference
        propMatch(item1.name, item2.name, lang);
      }
    }
  }
  else {
    propMatch(item1, item2, 'name');
  }
}

/**
 * Compare the address_parts properties if they exist.
 * Returns false if the objects are the same, and throws
 * an exception with the message 'different' if not.
 *
 * @param {object} item1
 * @param {object} item2
 * @returns {boolean}
 * @throws {Error}
 */
function assertAddressMatch(item1, item2) {
  // if neither record has address, assume same
  if (!item1.hasOwnProperty('address_parts') && !item2.hasOwnProperty('address_parts')) {
    return false;
  }

  // if both have address, check parts
  if (item1.hasOwnProperty('address_parts') && item2.hasOwnProperty('address_parts')) {
    propMatch(item1.address_parts, item2.address_parts, 'number');
    propMatch(item1.address_parts, item2.address_parts, 'street');
    propMatch(item1.address_parts, item2.address_parts, 'zip');

    return false;
  }

  // one has address and the other doesn't, different!
  throw new Error('different');
}



/**
 * Compare the geographic locations
 * Returns false if the objects are close enough, and throws
 * an exception with the message 'different' if not.
 *
 * @param {object} item1
 * @param {object} item2
 * @returns {boolean}
 * @throws {Error}
 */
function assertLocationMatch(item1, item2) {

  if(item1._type !== 'address' || item2._type !== 'address') {
    /* in explicit address case, location difference is most likely a data error */
    var p1 = { latitude: item1.center_point.lat, longitude: item1.center_point.lon };
    var p2 = { latitude: item2.center_point.lat, longitude: item2.center_point.lon };
    var distance = geolib.getDistance( p1, p2 );
    if( distance > minDistance) {
      throw new Error('different');
    }
  }
  return false;
}

/**
 * Compare the two records and return true if they differ and false if same.
 *
 * @param {object} item1
 * @param {object} item2
 * @returns {boolean}
 * @throws {Error}
 */
function isDifferent(item1, item2) {
  try {
    assertLayerMatch(item1, item2);
    assertParentHierarchyMatch(item1, item2);
    assertNameMatch(item1, item2);
    assertAddressMatch(item1, item2);
    assertLocationMatch(item1, item2);
  }
  catch (err) {
    if (err.message === 'different') {
      return true;
    }
    throw err;
  }

  return false;
}

/**
 * Throw exception if properties are different
 *
 * @param {object} item1
 * @param {object} item2
 * @param {string} prop
 * @throws {Error}
 */
function propMatch(item1, item2, prop) {
  var prop1 = item1[prop];
  var prop2 = item2[prop];

  // in the case the property is an array (currently only in parent schema)
  // simply take the 1st item. this will change in the near future to support multiple hierarchies
  if (_.isArray(prop1)) { prop1 = prop1[0]; }
  if (_.isArray(prop2)) { prop2 = prop2[0]; }

  // do not consider absence of information as a difference,
  // if a more complete document (item1) is already included.
  if(_.isUndefined(prop2)) {
    return;
  }

  if (normalizeString(prop1) !== normalizeString(prop2)) {
    throw new Error('different');
  }
}

/**
 * Remove punctuation and lowercase
 *
 * @param {string} str
 * @returns {string}
 */
function normalizeString(str) {
  if (!_.isString(str)) {
    return str;
  }

  if (_.isEmpty(str)) {
    return '';
  }

  return str.toLowerCase().split(/[ ,-]+/).join(' ');
}

module.exports.isDifferent = isDifferent;
