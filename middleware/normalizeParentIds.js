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
        var source = 'whosonfirst';

        // looking forward to the day we can remove all geonames specific hacks, but until then...
        // geonames sometimes has its own ids in the parent hierarchy, so it's dangerous to assume that 
        // it's always WOF ids and hardcode to that
        if (place.source === 'geonames' && place.source_id === place[placeType + '_gid'][0]) {
          source = place.source;
        }
        
        place[placeType + '_gid'] = [ makeNewId(source, placeType, place[placeType + '_gid']) ];
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
function makeNewId(source, placeType, id) {
  if (!id) {
    return;
  }

  var doc = new Document(source, placeType, id);
  return doc.getGid();
}

module.exports = setup;
