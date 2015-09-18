var logger = require('pelias-logger').get('api');
var _ = require('lodash');

// these are subjective terms, but wanted to add shortcuts to denote something
//  about importance
var SCORES = {
  EXACT: 1.0,
  EXCELLENT: 0.9,
  GOOD: 0.8,
  OKAY: 0.7,
  POOR: 0.6,
  NONE: 0.5,
  INVALID: 0.0
};

var BUCKETS = {
  _1_METER: 1,
  _10_METERS: 10,
  _100_METERS: 100,
  _250_METERS: 250,
  _1_KILOMETER: 1000
};

function setup() {
  return computeScores;
}

function computeScores(req, res, next) {
  // do nothing if no result data set
  if (!res.data || !res.data) {
    return next();
  }

  // loop through data items and determine confidence scores
  res.data = res.data.map(computeConfidenceScore);

  next();
}

function computeConfidenceScore(hit) {
  // non-number or invalid distance should be given confidence 0.0
  if (!_.isFinite(hit.distance) || hit.distance < 0) {
    hit.confidence = SCORES.INVALID;
    return hit;
  }

  var distance = hit.distance * 1000.0;

  // figure out which range the distance lies in and assign confidence accordingly
  if (distance < BUCKETS._1_METER) {
    hit.confidence = SCORES.EXACT;
  } else if (distance < BUCKETS._10_METERS) {
    hit.confidence = SCORES.EXCELLENT;
  } else if (distance < BUCKETS._100_METERS) {
    hit.confidence = SCORES.GOOD;
  } else if (distance < BUCKETS._250_METERS) {
    hit.confidence = SCORES.OKAY;
  } else if (distance < BUCKETS._1_KILOMETER) {
    hit.confidence = SCORES.POOR;
  } else {
    hit.confidence = SCORES.NONE;
  }

  return hit;

}

module.exports = setup;
