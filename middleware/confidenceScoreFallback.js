/**
 *
 * Basic confidence score should be computed and returned for each item in the results.
 * The score should range between 0-1, and take into consideration as many factors as possible.
 *
 * Some factors to consider:
 *
 * - number of results from ES
 * - fallback status (aka layer match between expected and actual)
 */

var check = require('check-types');
var logger = require('pelias-logger').get('api-confidence');

function setup() {
  return computeScores;
}

function computeScores(req, res, next) {
  // do nothing if no result data set or if the query is not of the fallback variety
  // later add disambiguation to this list
  if (check.undefined(req.clean) || check.undefined(res) ||
      check.undefined(res.data) || check.undefined(res.meta) ||
      res.meta.query_type !== 'fallback') {
    return next();
  }

  // loop through data items and determine confidence scores
  res.data = res.data.map(computeConfidenceScore.bind(null, req));

  next();
}

/**
 * Check all types of things to determine how confident we are that this result
 * is correct.
 *
 * @param {object} req
 * @param {object} hit
 * @returns {object}
 */
function computeConfidenceScore(req, hit) {

  // if parsed text doesn't exist, which it never should, just assign a low confidence and move on
  if (!req.clean.hasOwnProperty('parsed_text')) {
    hit.confidence = 0.1;
    hit.match_type = 'unknown';
    return hit;
  }

  // start with a confidence level of 1 because we trust ES queries to be accurate
  hit.confidence = 1.0;

  // in the case of fallback there might be deductions
  hit.confidence *= checkFallbackLevel(req, hit);

  // truncate the precision
  hit.confidence = Number((hit.confidence).toFixed(3));

  return hit;
}

function checkFallbackLevel(req, hit) {
  if (checkFallbackOccurred(req, hit)) {
    hit.match_type = 'fallback';

    // if we know a fallback occurred, deduct points based on layer granularity
    switch (hit.layer) {
      case 'venue':
      case 'address':
        logger.warn('Fallback scenarios should not result in address or venue records!', req.clean.parsed_text);
        return 0.8;
      case 'street':
        return 0.8;
      case 'locality':
      case 'borough':
      case 'neighbourhood':
        return 0.6;
      case 'macrocounty':
      case 'county':
      case 'localadmin':
        return 0.4;
      case 'region':
        return 0.3;
      case 'country':
      case 'dependency':
      case 'macroregion':
        return 0.1;
      default:
        return 0.1;
    }
  }

  hit.match_type = 'exact';
  return 1.0;
}

function checkFallbackOccurred(req, hit) {
  // at this time we only do this for address queries, so keep this simple
  // TODO: add other layer checks once we start handling disambiguation

  return (requestedAddress(req) && hit.layer !== 'address') ||
         (requestedStreet(req) && hit.layer !== 'street');
}

function requestedAddress(req) {
  // house number and street name were specified
  return req.clean.parsed_text.hasOwnProperty('number') &&
         req.clean.parsed_text.hasOwnProperty('street');
}

function requestedStreet(req) {
  // only street name was specified
  return !req.clean.parsed_text.hasOwnProperty('number') &&
          req.clean.parsed_text.hasOwnProperty('street');
}

module.exports = setup;
