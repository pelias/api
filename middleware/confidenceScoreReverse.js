var logger = require('pelias-logger').get('api');
var _ = require('lodash');

// these are subjective terms, but wanted to add shortcuts to denote something
//  about importance
var confidence = {
  exact: 1.0,
  excellent: 0.9,
  good: 0.8,
  okay: 0.7,
  poor: 0.6,
  none: 0.5
};

function setup(peliasConfig) {
  return computeScores;
}

function computeScores(req, res, next) {
  // do nothing if no result data set
  if (!req.results || !req.results.data) {
    return next();
  }

  // loop through data items and determine confidence scores
  req.results.data = req.results.data.map(computeConfidenceScore.bind(null, req));

  next();
}

function computeConfidenceScore(req, hit) {
  // non-number or invalid distance should be given confidence 0.0
  if (typeof hit.distance !== 'number' || hit.distance < 0) {
    hit.confidence = 0.0;
    return hit;
  }

  var meters = hit.distance * 1000;

  // figure out which range the distance lies in and assign confidence accordingly
  // TODO: this could probably be made more node-y with a map of function->number
  if (meters < 1.0) {
    hit.confidence = confidence.exact;
  } else if (_.inRange(meters, 1, 10)) {
    hit.confidence = confidence.excellent;
  } else if (_.inRange(meters, 10, 100)) {
    hit.confidence = confidence.good;
  } else if (_.inRange(meters, 100, 250)) {
    hit.confidence = confidence.okay;
  } else if (_.inRange(meters, 250, 1000)) {
    hit.confidence = confidence.poor;
  } else {
    hit.confidence = confidence.none;
  }

  return hit;

}

module.exports = setup;
