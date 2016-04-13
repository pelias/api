var _ = require('lodash');

var PARENT_PROPS = require('../helper/placeTypes');

var ADDRESS_PROPS = {
  'number': 'housenumber',
  'zip': 'postalcode',
  'street': 'street'
};


function setup() {
  return renamePlacenames;
}

function renamePlacenames(req, res, next) {
  // do nothing if no result data set
  if (!res || !res.data) {
    return next();
  }

  res.data = res.data.map(renameOneRecord);

  next();
}

/*
 * Rename the fields in one record
 */
function renameOneRecord(place) {
  if (place.address_parts) {
    Object.keys(ADDRESS_PROPS).forEach(function (prop) {
      place[ADDRESS_PROPS[prop]] = place.address_parts[prop];
    });
  }

  // merge the parent block into the top level object to flatten the structure
  if (place.parent) {
    PARENT_PROPS.forEach(function (prop) {
      place[prop] = place.parent[prop];
      place[prop + '_a'] = place.parent[prop + '_a'];
      place[prop + '_gid'] = place.parent[prop + '_id'];
    });
  }

  return place;
}

module.exports = setup;
