var extend = require('extend');

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
// config mapping of old names to new ones
var NAME_MAP = {
  'number': 'housenumber',
  'zip': 'postalcode',
  'alpha3': 'country_a',
  'admin0': 'country',
  'admin1': 'region',
  'admin1_abbr': 'region_a',
  'admin2': 'county',
  'local_admin': 'localadmin',
  'neighborhood': 'neighbourhood'
};

function setup() {

  return renamePlacenames;
}

function renamePlacenames(req, res, next) {

  // do nothing if no result data set
  if (!res || !res.data) {
    return next();
  }

  // loop through data items and remap placenames
  res.data = res.data.map(renameProperties);

  next();
}

function renameProperties(place) {
  var newPlace = {};
  Object.keys(place).forEach(function (property) {
    if (property === 'address') {
      extend(newPlace, renameProperties(place[property]));
    }
    else {
      renameProperty(place, newPlace, property);
    }
  });
  return newPlace;
}

function renameProperty(oldObj, newObj, property) {
  if (!oldObj.hasOwnProperty(property)) {
    return;
  }

  newObj[(NAME_MAP[property] || property)] = oldObj[property];
}

module.exports = setup;
