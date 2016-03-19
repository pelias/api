var extend = require('extend');
var iterate = require('../helper/iterate');
var _ = require('lodash');

/**
 - P is a preferred English name
 - Q is a preferred name (in other languages)
 - V is a well-known (but unofficial) variant for the place
 (e.g. "New York City" for New York)
 - S is either a synonym or a colloquial name for the place
 (e.g. "Big Apple" for New York), or a version of the name which
 is stripped of accent characters.
 - A is an abbreviation or code for the place (e.g. "NYC" for New
 York)
 */

var ADDRESS_PROPS = {
  'number': 'housenumber',
  'zip': 'postalcode',
  'street': 'street'
};

var PARENT_PROPS = [
  'country',
  'country_id',
  'country_a',
  'region',
  'region_id',
  'region_a',
  'county',
  'county_id',
  'county_a',
  'localadmin',
  'localadmin_id',
  'localadmin_a',
  'locality',
  'locality_id',
  'locality_a',
  'neighbourhood',
  'neighbourhood_id'
];


function setup() {
  return renamePlacenames;
}

function renamePlacenames(req, res, next) {
  // do nothing if no result data set
  if (!res || !res.results) {
    return next();
  }

  iterate(res.results, function(result) {
    // loop through data items and remap placenames
    if(result.data) {
      result.data = result.data.map(renameOneRecord);
    }
  });

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
    });
  }

  return place;
}

module.exports = setup;
