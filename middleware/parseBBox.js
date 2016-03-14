var logger = require('pelias-logger').get('api');

/**
 * Parses the bounding box property in docs, if one is found
 */

function setup() {
  return function (req, res, next) {
    // do nothing if no result data set
    if (!res || !res.data) {
      return next();
    }

    res.data = res.data.map(parseBBox);

    next();
  };
}

/*
 * Parse the bbox property and form an object
 */
function parseBBox(place) {

  if (place && place.bounding_box) {
    try {
      place.bounding_box = JSON.parse(place.bounding_box);
    }
    catch (err) {
      logger.error('Invalid bounding_box json string:', place);
      delete place.bounding_box;
    }
  }

  return place;
}

module.exports = setup;
