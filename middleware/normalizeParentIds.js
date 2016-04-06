var logger = require('pelias-logger').get('api');
var Document = require('pelias-model').Document;

var placeTypes = [
  'country',
  'macroregion',
  'region',
  'macrocounty',
  'county',
  'localadmin',
  'locality',
  'neighbourhood',
  'borough'
];

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

  if (place && place.parent) {
    placeTypes.forEach(function (placeType) {
      if (place.parent[placeType] && place.parent[placeType].length > 0 && place.parent[placeType][0]) {
        place.parent[placeType + '_id'] = [ makeNewId(placeType, place.parent[placeType + '_id']) ];
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
  var doc = new Document('whosonfirst', placeType, id);
  return doc.getGid();
}

module.exports = setup;
