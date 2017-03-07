var logger = require('pelias-logger').get('api');
var Document = require('pelias-model').Document;

var placeTypes = require('../helper/placeTypes');

/**
 * Convert WOF integer ids to Pelias formatted ids that can be used by the /place endpoint.
 * This should probably be moved to the import pipeline once we are happy with the way this works.
 */

function setup() {
  return function (req, res, next) {
    // do nothing if no result data set
    if (!res || !res.data) {
      return next();
    }

    res.data = res.data.map(normalizeParentIds);

    next();
  };
}

/**
 * Update all parent ids in the admin hierarchy
 *
 * @param {object} place
 * @return {object}
 */
function normalizeParentIds(place) {

  if (place) {
    placeTypes.forEach(function (placeType) {
      if (place[placeType] && place[placeType].length > 0 && place[placeType][0]) {
        place[placeType + '_gid'] = [ makeNewId(placeType, place[placeType + '_gid']) ];
      }
    });
  }

  return place;
}

/**
 * Generate a valid Pelias ids from placetype and WOF id.
 * Assumes all of the incoming ids are WOF ids.
 *
 * @param {string} placeType
 * @param {number} id
 * @return {string}
 */
function makeNewId(placeType, id) {
  if (!id) {
    return;
  }

  var doc = new Document('whosonfirst', placeType, id);
  return doc.getGid();
}

module.exports = setup;
