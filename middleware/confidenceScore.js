/**
 *
 *Basic confidence score should be computed and returned for each item in the results.
 * The score should range between 0-1, and take into consideration as many factors as possible.
 *
 * Some factors to consider:
 *
 * - number of results from ES
 * - score of item within the range of highest-lowest scores from ES (within the returned set)
 * - linguistic match of query
 * - detection (or specification) of query type. i.e. an address shouldn't match an admin address.
 */

var stats = require('stats-lite');
var logger = require('pelias-logger').get('api');

var RELATIVE_SCORES = true;

function setup(peliasConfig) {
  RELATIVE_SCORES = peliasConfig.hasOwnProperty('relativeScores') ? peliasConfig.relativeScores : true;
  return computeScores;
}

function computeScores(req, res, next) {
  // do nothing if no result data set
  if (!req.results || !req.results.data || !req.results.meta) {
    return next();
  }

  // compute standard deviation and mean from all scores
  var scores = req.results.meta.scores;
  var stdev = computeStandardDeviation(scores);
  var mean = stats.mean(scores);

  // loop through data items and determine confidence scores
  req.results.data = req.results.data.map(computeConfidenceScore.bind(null, req, mean, stdev));

  next();
}

/**
 * Check all types of things to determine how confident we are that this result
 * is correct. Score is based on overall score distribution in the result set
 * as well as how closely the result matches the input parameters.
 *
 * @param {object} req
 * @param {number} mean
 * @param {number} stdev
 * @param {object} hit
 * @returns {object}
 */
function computeConfidenceScore(req, mean, stdev, hit) {
  var dealBreakers = checkForDealBreakers(req, hit);
  if (dealBreakers) {
    hit.confidence = 0.5;
    return hit;
  }

  var checkCount = 3;
  hit.confidence = 0;

  if (RELATIVE_SCORES) {
    checkCount += 2;
    hit.confidence += checkDistanceFromMean(hit._score, mean, stdev);
    hit.confidence += computeZScore(hit._score, mean, stdev);
  }
  hit.confidence += checkName(req.clean.input, req.clean.parsed_input, hit);
  hit.confidence += checkQueryType(req.clean.parsed_input, hit);
  hit.confidence += checkAddress(req.clean.parsed_input, hit);

  // TODO: look at categories and location

  hit.confidence /= checkCount;

  logger.debug('[confidence]:', hit.confidence, hit.name.default);

  return hit;
}

function checkForDealBreakers(req, hit) {
  if (!req.clean.parsed_input) {
    return false;
  }

  if (req.clean.parsed_input.state && req.clean.parsed_input.state !== hit.admin1_abbr) {
    logger.debug('[confidence][deal-breaker]: state !== admin1_abbr');
    return true;
  }

  if (req.clean.parsed_input.postalcode && req.clean.parsed_input.postalcode !== hit.zip) {
    logger.debug('[confidence][deal-breaker]: postalcode !== zip');
    return true;
  }
}

/**
 * Check how statistically significant the score of this result is
 * given mean and standard deviation
 *
 * @param {number} score
 * @param {number} mean
 * @param {number} stdev
 * @returns {number}
 */
function checkDistanceFromMean(score, mean, stdev) {
  return (score - mean) > stdev ? 1 : 0;
}

/**
 * Compare input string or name component of parsed_input against
 * default name in result
 *
 * @param {string} input
 * @param {object|undefined} parsed_input
 * @param {object} hit
 * @returns {number}
 */
function checkName(input, parsed_input, hit) {
  // parsed_input name should take precedence if available since it's the cleaner name property
  if (parsed_input && parsed_input.name && hit.name.default.toLowerCase() === parsed_input.name.toLowerCase()) {
    return 1;
  }

  // if no parsed_input check the input value as provided against result's default name
  if (hit.name.default.toLowerCase() === input.toLowerCase()) {
    return 1;
  }

  // if no matches detected, don't judge too harshly since it was a longshot anyway
  return 0.7;
}

/**
 * Input being set indicates the query was for an address
 * check if house number was specified and found in result
 *
 * @param {object|undefined} input
 * @param {object} hit
 * @returns {number}
 */
function checkQueryType(input, hit) {
  if (!!input.number && (!hit.address || (hit.address && !hit.address.number))) {
    return 0;
  }
  return 1;
}

/**
 * Determine the quality of the property match
 *
 * @param {string|number|undefined|null} inputProp
 * @param {string|number|undefined|null} hitProp
 * @param {boolean} expectEnriched
 * @returns {number}
 */
function propMatch(inputProp, hitProp, expectEnriched) {

  // both missing, but expect to have enriched value in result => BAD
  if (!inputProp && !hitProp && expectEnriched) { return 0; }

  // both missing, and no enrichment expected => GOOD
  if (!inputProp && !hitProp) { return 1; }

  // input has it, result doesn't => BAD
  if (inputProp && !hitProp) { return 0; }

  // input missing, result has it, and enrichment is expected => GOOD
  if (!inputProp && hitProp && expectEnriched) { return 1; }

  // input missing, result has it, enrichment not desired => 50/50
  if (!inputProp && hitProp) { return 0.5; }

  // both present, values match => GREAT
  if (inputProp && hitProp && inputProp.toString().toLowerCase() === hitProp.toString().toLowerCase()) { return 1; }

  // ¯\_(ツ)_/¯
  return 0.7;
}

/**
 * Check various parts of the parsed input address
 * against the results
 *
 * @param {object} input
 * @param {string|number} [input.number]
 * @param {string} [input.street]
 * @param {string} [input.postalcode]
 * @param {string} [input.state]
 * @param {string} [input.country]
 * @param {object} hit
 * @param {object} [hit.address]
 * @param {string|number} [hit.address.number]
 * @param {string} [hit.address.street]
 * @param {string|number} [hit.zip]
 * @param {string} [hit.admin1_abbr]
 * @param {string} [hit.alpha3]
 * @returns {number}
 */
function checkAddress(input, hit) {
  var checkCount = 5;
  var res = 0;

  if (input && input.number && input.street) {
    res += propMatch(input.number, (hit.address ? hit.address.number : null), false);
    res += propMatch(input.street, (hit.address ? hit.address.street : null), false);
    res += propMatch(input.postalcode, (hit.address ? hit.address.zip: null), true);
    res += propMatch(input.state, hit.admin1_abbr, true);
    res += propMatch(input.country, hit.alpha3, true);

    res /= checkCount;
  }
  else {
    res = 1;
  }

  return res;
}

/**
 * z-scores have an effective range of -3.00 to +3.00.
 * An average z-score is ZERO.
 * A negative z-score indicates that the item/element is below
 * average and a positive z-score means that the item/element
 * in above average. When teachers say they are going to "curve"
 * the test, they do this by computing z-scores for the students' test scores.
 *
 * @param {number} score
 * @param {number} mean
 * @param {number} stdev
 * @returns {number}
 */
function computeZScore(score, mean, stdev) {
  if (stdev < 0.01) {
    return 0;
  }
  // because the effective range of z-scores is -3.00 to +3.00
  // add 10 to ensure a positive value, and then divide by 10+3+3
  // to further normalize to %-like result
  return (((score - mean) / (stdev)) + 10) / 16;
}

/**
 * Computes standard deviation given an array of values
 *
 * @param {Array} scores
 * @returns {number}
 */
function computeStandardDeviation(scores) {
  var stdev = stats.stdev(scores);
  // if stdev is low, just consider it 0
  return (stdev < 0.01) ? 0 : stdev;
}


module.exports = setup;
