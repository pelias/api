const _ = require('lodash');
const logger = require('pelias-logger').get('api');
const codec = require('pelias-model').codec;

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
  if (_.has(place, 'addendum.override')) {
    try {
      const overrideData = codec.decode(place.addendum.override);
      place = _.merge(place, overrideData);
    } catch (err) {
      logger.error('Invalid addendum override json string:', place.addendum);
    }

    delete place.addendum.override;

    if (_.isEmpty(place.addendum)) {
      delete place.addendum;
    }
  }
  return place;
}

module.exports = setup;
