var logger = require('pelias-logger').get('api');
var _ = require('lodash');

// these are subjective terms, but wanted to add shortcuts to denote something
//  about importance
var EXACT = 1.0;
var EXCELLENT = 0.9;
var GOOD = 0.8;
var OKAY = 0.7;
var POOR = 0.6;
var NONE = 0.5;
var INVALID = 0.0;

var _1_METER = 1;
var _10_METERS = 10;
var _100_METERS = 100;
var _250_METERS = 250;
var _1_KILOMETER = 1000;

function setup() {
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
  if (!_.isFinite(hit.distance) || hit.distance < 0) {
    hit.confidence = INVALID;
    return hit;
  }

  var distance = hit.distance * 1000.0;

  // figure out which range the distance lies in and assign confidence accordingly
  if (distance < _1_METER) {
    hit.confidence = EXACT;
  } else if (distance < _10_METERS) {
    hit.confidence = EXCELLENT;
  } else if (distance < _100_METERS) {
    hit.confidence = GOOD;
  } else if (distance < _250_METERS) {
    hit.confidence = OKAY;
  } else if (distance < _1_KILOMETER) {
    hit.confidence = POOR;
  } else {
    hit.confidence = NONE;
  }

  return hit;

}

module.exports = setup;
