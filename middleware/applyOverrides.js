const _ = require('lodash');

function setup() {
  return applyOverrides;
}

function applyOverrides(req, res, next) {
  // do nothing if no result data set
  if (!res || !res.data) {
    return next();
  }

  res.data = res.data.map(overrideOneRecord);

  next();
}

/*
 * Rename the fields in one record
 */
function overrideOneRecord(place) {
  if (place.addendum && place.addendum.override) {
    place = _.merge(place, place.addendum.override);
  }
  return place;
}

module.exports = setup;
