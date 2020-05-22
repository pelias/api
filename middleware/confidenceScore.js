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

const _ = require('lodash');
const stats = require('stats-lite');
const logger = require('pelias-logger').get('api');
const field = require('../helper/fieldValue');

var RELATIVE_SCORES = true;

function setup(peliasConfig) {
  if (!_.isNil(peliasConfig)) {
    RELATIVE_SCORES = peliasConfig.hasOwnProperty('relativeScores') ? peliasConfig.relativeScores : true;
  }
  return computeScores;
}

function computeScores(req, res, next) {
  // do nothing if no result data set or if query is not of the pelias_parser variety
  if (_.isUndefined(req.clean) || _.isUndefined(res) ||
      _.isUndefined(res.data) || _.isUndefined(res.meta) ||
      res.meta.query_type !== 'search_pelias_parser') {
    return next();
  }

  // compute standard deviation and mean from all scores
  var scores = res.meta.scores;
  var stdev = computeStandardDeviation(scores);
  var mean = stats.mean(scores);

  // loop through data items and determine confidence scores
  res.data = res.data.map(computeConfidenceScore.bind(null, req, mean, stdev));

  next();
}

/**
 * Check all types of things to determine how confident we are that this result
 * is correct. Score is based on overall score distribution in the result set
 * as well as how closely the result matches the text parameters.
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
  hit.confidence += checkName(req.clean.text, req.clean.parsed_text, hit);
  hit.confidence += checkQueryType(req.clean.parsed_text, hit);
  hit.confidence += checkAddress(req.clean.parsed_text, hit);

  // TODO: look at categories and location

  hit.confidence /= checkCount;
  hit.confidence = Number((hit.confidence).toFixed(3));

  return hit;
}

/*
 * Check for clearly mismatching properties in a result
 * zip code and state (region) are currently checked if present
 *
 * @param {object|undefined} text
 * @param {object} hit
 * @returns {bool}
 */
function checkForDealBreakers(req, hit) {
  if (_.isUndefined(req.clean.parsed_text)) {
    return false;
  }

  if (!_.isNil(req.clean.parsed_text.state) && !_.isNil(hit.parent) &&
      hit.parent.region_a && req.clean.parsed_text.state !== hit.parent.region_a[0]) {
    logger.debug('[confidence][deal-breaker]: state !== region_a');
    return true;
  }

  if (!_.isNil(req.clean.parsed_text.postalcode) && !_.isNil(hit.address_parts) &&
      req.clean.parsed_text.postalcode !== hit.address_parts.zip) {
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
 * Compare text string or name component of parsed_text against
 * default name in result
 *
 * @param {string} text
 * @param {object|undefined} parsed_text
 * @param {object} hit
 * @returns {number}
 */
function checkName(text, parsed_text, hit) {
  // parsed_text name should take precedence if available since it's the cleaner name property
  if (!_.isNil(parsed_text) && !_.isNil(parsed_text.name) &&
    field.getStringValue(hit.name.default).toLowerCase() === parsed_text.name.toLowerCase()) {
    return 1;
  }

  // if no parsed_text check the text value as provided against result's default name
  if (field.getStringValue(hit.name.default).toLowerCase() === text.toLowerCase()) {
    return 1;
  }

  // if no matches detected, don't judge too harshly since it was a longshot anyway
  return 0.7;
}

/**
 * text being set indicates the query was for an address
 * check if house number was specified and found in result
 *
 * @param {object|undefined} text
 * @param {object} hit
 * @returns {number}
 */
function checkQueryType(text, hit) {
  if (!_.isNil(text) && !_.isNil(text.housenumber) &&
      (_.isUndefined(hit.address_parts) ||
      (!_.isNil(hit.address_parts) && _.isUndefined(hit.address_parts.number)))) {
    return 0;
  }
  return 1;
}

/**
 * Determine the quality of the property match
 *
 * @param {string|number|undefined|null} textProp
 * @param {string|number|undefined|null} hitProp
 * @param {boolean} expectEnriched
 * @returns {number}
 */
function propMatch(textProp, hitProp, expectEnriched) {

  // both missing, but expect to have enriched value in result => BAD
  if (_.isUndefined(textProp) && _.isUndefined(hitProp) && !_.isNil(expectEnriched)) { return 0; }

  // both missing, and no enrichment expected => GOOD
  if (_.isUndefined(textProp) && _.isUndefined(hitProp)) { return 1; }

  // text has it, result doesn't => BAD
  if (!_.isNil(textProp) && _.isUndefined(hitProp)) { return 0; }

  // text missing, result has it, and enrichment is expected => GOOD
  if (_.isUndefined(textProp) && !_.isNil(hitProp) && !_.isNil(expectEnriched)) { return 1; }

  // text missing, result has it, enrichment not desired => 50/50
  if (_.isUndefined(textProp) && !_.isNil(hitProp)) { return 0.5; }

  // both present, values match => GREAT
  if (!_.isNil(textProp) && !_.isNil(hitProp) &&
      textProp.toString().toLowerCase() === hitProp.toString().toLowerCase()) { return 1; }

  // ¯\_(ツ)_/¯
  return 0.7;
}

/**
 * Check various parts of the parsed text address
 * against the results
 *
 * @param {object} text
 * @param {string|number} [text.housenumber]
 * @param {string} [text.street]
 * @param {string} [text.postalcode]
 * @param {string} [text.state]
 * @param {string} [text.country]
 * @param {object} hit
 * @param {object} [hit.address_parts]
 * @param {string|number} [hit.address_parts.number]
 * @param {string} [hit.address_parts.street]
 * @param {string|number} [hit.address_parts.zip]
 * @param {Array} [hit.parent.region_a]
 * @param {Array} [hit.parent.country_a]
 * @returns {number}
 */
function checkAddress(text, hit) {
  var checkCount = 5;
  var res = 0;

  if (!_.isNil(text) && !_.isNil(text.housenumber) && !_.isNil(text.street)) {
    res += propMatch(text.housenumber, (hit.address_parts ? hit.address_parts.number : null), false);
    res += propMatch(text.street, (hit.address_parts ? hit.address_parts.street : null), false);
    res += propMatch(text.postalcode, (hit.address_parts ? hit.address_parts.zip: null), true);
    res += propMatch(text.state, ((hit.parent && hit.parent.region_a) ? hit.parent.region_a[0] : null), true);
    res += propMatch(text.country, ((hit.parent && hit.parent.country_a) ? hit.parent.country_a[0] :null), true);

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
