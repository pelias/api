'use strict';

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
var logger = require('pelias-logger').get('api');
const _ = require('lodash');

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
        logger.warn('Fallback scenarios should not result in address or venue records!', req.clean.parsed_text);
        return 0.8;
      case 'address':
        return 0.8;
      case 'street':
        return 0.8;
      case 'localadmin':
      case 'locality':
      case 'borough':
      case 'neighbourhood':
        return 0.6;
      case 'macrocounty':
      case 'county':
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

/**
 * In parsed_text we might find any of the following properties:
 *   query
 *   number
 *   street
 *   neighbourhood
 *   borough
 *   city
 *   county
 *   state
 *   postalcode
 *   country
 *
 * They do not map 1:1 to our layers so the following somewhat complicated
 * mapping structure is needed to set clear rules for comparing what was requested
 * by the query and what has been received as a result to determine if a fallback occurred.
 */
const fallbackRules = [
  {
    name: 'venue',
    notSet: [],
    set: ['query'],
    expectedLayers: ['venue']
  },
  {
    name: 'address',
    notSet: ['query'],
    set: ['number', 'street'],
    expectedLayers: ['address']
  },
  {
    name: 'street',
    notSet: ['query', 'number'],
    set: ['street'],
    expectedLayers: ['street']
  },
  {
    name: 'neighbourhood',
    notSet: ['query', 'number', 'street'],
    set: ['neighbourhood'],
    expectedLayers: ['neighbourhood']
  },
  {
    name: 'borough',
    notSet: ['query', 'number', 'street', 'neighbourhood'],
    set: ['borough'],
    expectedLayers: ['borough']
  },
  {
    name: 'city',
    notSet: ['query', 'number', 'street', 'neighbourhood', 'borough'],
    set: ['city'],
    expectedLayers: ['borough', 'locality', 'localadmin']
  },
  {
    name: 'county',
    notSet: ['query', 'number', 'street', 'neighbourhood', 'borough', 'city'],
    set: ['county'],
    expectedLayers: ['county']
  },
  {
    name: 'state',
    notSet: ['query', 'number', 'street', 'neighbourhood', 'borough', 'city', 'county'],
    set: ['state'],
    expectedLayers: ['region']
  },
  {
    name: 'country',
    notSet: ['query', 'number', 'street', 'neighbourhood', 'borough', 'city', 'county', 'state'],
    set: ['country'],
    expectedLayers: ['country']
  }
];

function checkFallbackOccurred(req, hit) {

  // short-circuit after finding the first fallback scenario
  const res = _.find(fallbackRules, (rule) => {

    return (
      // verify that more granular properties are not set
      notSet(req.clean.parsed_text, rule.notSet) &&
      // verify that expected property is set
      areSet(req.clean.parsed_text, rule.set) &&
      // verify that expected layer(s) was not returned
      rule.expectedLayers.indexOf(hit.layer) === -1
    );
  });

  return !!res;
}

function notSet(parsed_text, notSet) {
  if (notSet.length === 0) {
    return true;
  }

  return (
    _.every(notSet, (prop) => {
      return !_.get(parsed_text, prop, false);
    })
  );
}

function areSet(parsed_text, areSet) {
  if (areSet.length === 0) {
    logger.warn('Expected properties in fallbackRules should never be empty');
    return true;
  }

  return (
    _.every(areSet, (prop) => {
      return _.get(parsed_text, prop, false);
    })
  );
}

module.exports = setup;
