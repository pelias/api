/**
 *
 * Basic confidence score should be computed and returned for each item in the results.
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
var check = require('check-types');
var _ = require('lodash');

var RELATIVE_SCORES = true;

var languages = ['default'];
var adminProperties;
var nameWeight = 1;

// default configuration for address confidence check
var confidenceAddressParts = {
  number: { parent: 'address_parts', field: 'number', enrich: false},
  street: { parent: 'address_parts', field: 'street', enrich: false},
  postalcode: { parent: 'address_parts', field: 'zip', enrich: true},
  state: { parent: 'parent', field: 'region_a', enrich: true},
  country: { parent: 'parent', field: 'country_a', enrich: true}
};

function setup(peliasConfig) {
  if (check.assigned(peliasConfig)) {
    RELATIVE_SCORES = peliasConfig.hasOwnProperty('relativeScores') ? peliasConfig.relativeScores : true;
    if (peliasConfig.languages) {
      languages = _.uniq(languages.concat(peliasConfig.languages));
    }
    if (peliasConfig.localization) {
      if(peliasConfig.localization.confidenceAdminProperties) {
	adminProperties = peliasConfig.localization.confidenceAdminProperties;
      }
      if(peliasConfig.localization.confidenceAddressParts) {
	confidenceAddressParts = peliasConfig.localization.confidenceAddressParts;
      }
      nameWeight = peliasConfig.localization.confidenceNameWeight || nameWeight;
    }
  }
  return computeScores;
}

function computeScores(req, res, next) {
  // do nothing if no result data set
  if (check.undefined(req.clean) || check.undefined(res) ||
      check.undefined(res.data) || check.undefined(res.meta)) {
    return next();
  }

  // compute standard deviation and mean from all scores
  var scores = res.meta.scores;
  var stdev = computeStandardDeviation(scores);
  var mean = stats.mean(scores);

  // loop through data items and determine confidence scores
  res.data = res.data.map(computeConfidenceScore.bind(null, req, mean, stdev));

  res.data.sort(function(a, b) { return(b.confidence - a.confidence); });

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
    hit.confidence = 0.1;
    return hit;
  }

  var checkCount = 2 + nameWeight; // name can have extra strong weight
  hit.confidence = 0;

  if (RELATIVE_SCORES) {
    checkCount += 2;
    hit.confidence += checkDistanceFromMean(hit._score, mean, stdev);
    hit.confidence += computeZScore(hit._score, mean, stdev);
  }
  hit.confidence += nameWeight*checkName(req.clean.text, req.clean.parsed_text, hit);
  hit.confidence += checkQueryType(req.clean.parsed_text, hit);
  hit.confidence += checkAddress(req.clean.parsed_text, hit);

  if(adminProperties && req.clean.parsed_text && req.clean.parsed_text.regions &&
    req.clean.parsed_text.regions.length>1) {
    hit.confidence += checkAdmin(req.clean.parsed_text, hit);
    checkCount++;
  }
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
  if (check.undefined(req.clean.parsed_text)) {
    return false;
  }

  if (check.assigned(req.clean.parsed_text.state) && req.clean.parsed_text.state !== hit.parent.region_a[0]) {
    logger.debug('[confidence][deal-breaker]: state !== region_a');
    return true;
  }

  if (check.assigned(req.clean.parsed_text.postalcode) && check.assigned(hit.address_parts) &&
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


// should be improved to handle better complex names such as '5th forest rd'
function normalizeName(text) {
  return text.toLowerCase().replace(/[0-9]/g, '').trim();
}

/**
 * Compare text string against configuration defined language versions of a property
 *
 * @param {string} text
 * @param {object} property with language versions
 * @returns {bool}
 */

function checkLanguageProperty(text, propertyObject) {
  var ltext = normalizeName(text);
  for (var lang in propertyObject) {
    if (languages.indexOf(lang) === -1) {
      continue;
    }
    if (normalizeName(propertyObject[lang]) === ltext) {
      return true;
    }
  }
  return false;
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
  if (check.assigned(parsed_text) && check.assigned(parsed_text.name)) {
    if (checkLanguageProperty(parsed_text.name, hit.name)) {
      return 1;
    }
  } else {
    // if no parsed_text check the text value as provided against result's name
    if (checkLanguageProperty(text, hit.name)) {
      return 1;
    }
  }

  // no matches detected
  return 0;
}

/**
 * text.number being set indicates the query was for an address
 * check if house number was specified and found in result
 *
 * @param {object|undefined} text
 * @param {object} hit
 * @returns {number}
 */
function checkQueryType(text, hit) {
  if (check.assigned(text) && check.assigned(text.number) &&
      (check.undefined(hit.address_parts) ||
      (check.assigned(hit.address_parts) && check.undefined(hit.address_parts.number)))) {
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

  // both missing = match
  if (check.undefined(textProp) && check.undefined(hitProp)) {
    if (check.assigned(expectEnriched)) { return 0.5; }
    else { return 0.8; } // no enrichment expected => GOOD
  }

  // text has it, result missing
  if (check.assigned(textProp) && check.undefined(hitProp)) {
    if (check.assigned(expectEnriched)) { return 0.2; }
    else { return 0.4; }
  }

  // text missing, result has it
  if (check.undefined(textProp) && check.assigned(hitProp)) {
    if (check.assigned(expectEnriched)) { return 0.8; }
    else { return 0.5; }
  }

  // both present

  if (textProp.toString().toLowerCase() === hitProp.toString().toLowerCase()) {
    return 1; //values match
  }

  // both present, values differ => BAD regardless of enrichment
  return 0;
}

/**
 * Check various parts of the parsed text address
 * against the results
 *
 * @param {object} text
 * @param {string|number} [text.number]
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
  var res = 0;

  if (check.assigned(text) && check.assigned(text.number) && check.assigned(text.street)) {
    var checkCount = 0;

    for(var key in confidenceAddressParts) {
      var value;
      var part = confidenceAddressParts[key];
      var parent = hit[part.parent];

      if(!parent) {
	value = null;
      } else {
	value = parent[part.field];
	if (Array.isArray(value)) {
	  value = value[0]; // TODO: check all array values
	}
      }
      res += propMatch(text[key], value, part.enrich);
      checkCount++;
    }
    res /= checkCount;
  }
  else {
    res = 1;
  }
  logger.debug('address match', res );

  return res;
}

/**
 * Check admin regions of the parsed text against a result.
 *
 * @param {object} text
 * @param {object} [text.regions]
 * @param {object} hit
 * @param {object} [hit.parent]
 * @returns {number}
 */
function checkAdmin(text, hit) {
  var res = 0;
  var regions = [];
  var source = text.regions;

  for(var i=1; i<source.length; i++) { // drop 1st entry = actual name or street
    regions.push(source[i].toLowerCase());
  }

  // find out maximum count for matching properties
  var count = Math.min(regions.length, adminProperties.length);

  // loop trough configured properties to find a match
  adminProperties.forEach( function(key) {
    var prop = hit.parent[key];
    if (prop) {
      if (Array.isArray(prop)) {
	for(var i=0; i<prop.length; i++) {
	  var value = prop[i].toLowerCase();
	  if(regions.indexOf(value) !== -1) {
	    res = res + 1; // match
	    break;
	  }
	}
      } else {
	if( regions.indexOf(prop) !== -1 ) {
	  res = res + 1; // match
	}
      }
    }
  });

  // set an upper limit; several parent fields can match the same text
  // e.g. New York, New York (city, state)
  res = Math.min(res/count, 1.0);

  logger.debug('admin match', res);
  return res;
}

/**
 * z-scores have an effective range of -3.00 to +3.00.
 * An average z-score is ZERO.
 * A negative z-score indicates that the item/element is below
 * average and a positive z-score means that the item/element
 * in above average. When teachers say they are going to 'curve'
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
