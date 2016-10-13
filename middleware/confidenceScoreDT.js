
/**
 *
 * Basic confidence score should be computed and returned for each item in the results.
 * The score should range between 0-1, and take into consideration as many factors as possible.
 */

var stats = require('stats-lite');
var logger = require('pelias-logger').get('api');
var check = require('check-types');
var _ = require('lodash');
var fuzzy = require('../helper/fuzzyMatch');
var languages = ['default'];

var adminProperties;
var minConfidence=0, relativeMinConfidence;

// default configuration for address confidence check
var confidenceAddressParts = {
  number: { parent: 'address_parts', field: 'number', numeric: true, weight: 0.5 },
  street: { parent: 'address_parts', field: 'street', numeric: false, weight: 1 },
  postalcode: { parent: 'address_parts', field: 'zip', numeric: false, weight: 1 },
  state: { parent: 'parent', field: 'region_a', numeric: false, weight: 3},
  country: { parent: 'parent', field: 'country_a', numeric: false, weight: 4 }
};

function setup(peliasConfig) {
  if (check.assigned(peliasConfig)) {
    if (peliasConfig.languages) {
      languages = _.uniq(languages.concat(peliasConfig.languages));
    }
    if(peliasConfig.minConfidence) {
      minConfidence = peliasConfig.minConfidence;
    }
    relativeMinConfidence = peliasConfig.relativeMinConfidence;
    var localization = peliasConfig.localization;
    if (localization) {
      if(localization.confidenceAdminProperties) {
        adminProperties = localization.confidenceAdminProperties;
      }
      if(localization.confidenceAddressParts) {
        confidenceAddressParts = localization.confidenceAddressParts;
      }
    }
  }
  return computeScores;
}


function compareProperty(p1, p2) {
  if (Array.isArray(p1)) {
    p1 = p1[0];
  }
  if (Array.isArray(p2)) {
    p2 = p2[0];
  }

  if (!p1 || !p2) {
    return 0;
  }
  if (typeof p1 === 'string'){
    p1 = p1.toLowerCase();
  }
  if (typeof p2 === 'string'){
    p2 = p2.toLowerCase();
  }
  return (p1<p2?-1:(p1>p2?1:0));
}


/* Quite heavily fi specific sorting */
function compareResults(a, b) {
  if (b.confidence !== a.confidence) {
    return b.confidence - a.confidence;
  }
  var diff;
  if (a.parent && b.parent) {
    diff = compareProperty(a.parent.localadmin, b.parent.localadmin);
    if (diff) {
      return diff;
    }
  }
  if (a.address_parts && b.address_parts) {
    diff = compareProperty(a.address_parts.street, b.address_parts.street);
    if (diff) {
      return diff;
    }

    var n1 = parseInt(a.address_parts.number);
    var n2 = parseInt(b.address_parts.number);
    if (!isNaN(n1) && !isNaN(n2)) {
      diff = compareProperty(n1, n2);
      if (diff) {
        return diff;
      }
    }
  }
  if (a.name && b.name) {
    diff = compareProperty(a.name.default, b.name.default);
    if (diff) {
      return diff;
    }
  }

  return 0;
}

function computeScores(req, res, next) {
  // do nothing if no result data set
  if (!check.assigned(req.clean) || !check.assigned(res) ||
      !check.assigned(res.data) || res.data.length===0 || !check.assigned(res.meta)) {
    return next();
  }

  // loop through data items and determine confidence scores
  res.data = res.data.map(computeConfidenceScore.bind(null, req));

  res.data.sort(compareResults);

  var bestConfidence = res.data[0].confidence;
  var limit = minConfidence;
  if(relativeMinConfidence) {
    limit = Math.max(limit, relativeMinConfidence * bestConfidence);
  }
  res.data = res.data.filter(function(doc) {
    return(doc.confidence>limit);
  });

  next();
}

// simple helper to get two name variants from addresss without country context
function namesFromAddress(street, number) {
  var name1 = street || '';
  var name2 = name1;
  var space = (name1.length===0?'':' ');

  if(check.assigned(number)) {
    name1 = name1 + space  + number;
    name2 = number + space + name2;
  }
  return [name1, name2];
}

/**
 * Check all types of things to determine how confident we are that this result
 * is correct. Score is based on overall score distribution in the result set
 * as well as how closely the result matches the text parameters.
 *
 * @param {object} req
 * @param {object} hit
 * @returns {object}
 */
function computeConfidenceScore(req, hit) {

  hit.confidence = 0;
  var checkCount = 0;
  var parsedText = req.clean.parsed_text;

  // first compare address parts one by one
  if (parsedText) {
    for(var key in confidenceAddressParts) {
      if(check.assigned(parsedText[key])) {
        hit.confidence += confidenceAddressParts[key].weight*checkAddressPart(parsedText, hit, key);
        checkCount += confidenceAddressParts[key].weight;
      }
    }
  }

  // compare parsed name (or raw text) against configured language versions of name
  hit.confidence += checkName(req.clean.text, parsedText, hit);
  checkCount++;

  if(adminProperties && parsedText && parsedText.regions && parsedText.regions.length>1) {
    // keep admin scoring proportion constant 50%
    // regardless of count of finer scores
    // so, score is max 0.5 if city is all wrong
    hit.confidence += checkCount*checkRegions(parsedText, hit);
    checkCount*=2;
  }

  // TODO: look at categories

  hit.confidence /= checkCount;
  logger.debug('### confidence', hit.confidence);

  return hit;
}

/**
 * Compare text string against configuration defined language versions of a property
 *
 * @param {string} text
 * @param {object} property with language versions
 * @returns {bool}
 */

function checkLanguageProperty(text, propertyObject, stripNumbers) {
  var bestScore = 0;
  var bestName;

  for (var lang in propertyObject) {
    if (languages.indexOf(lang) === -1) {
      continue;
    }
    var score;

    if(stripNumbers) {
      score = fuzzy.match(text, propertyObject[lang].replace(/[0-9]/g, '').trim());
    } else {
      score = fuzzy.match(text, propertyObject[lang]);
    }

    if (score >= bestScore ) {
      bestScore = score;
      bestName = propertyObject[lang];
    }
  }
  logger.debug('name score', bestScore, text, bestName);

  return bestScore;
}

/**
 * Compare text string or name component of parsed_text against
 * default name in result
 * Note: consider also street here as it often stores searched name
 *
 * @param {string} text
 * @param {object|undefined} parsed_text
 * @param {object} hit
 * @returns {number}
 */
function checkName(text, parsed_text, hit) {

  // parsed_text name should take precedence if available since it's the cleaner name property
  if (check.assigned(parsed_text) && check.assigned(parsed_text.name)) {
    return(checkLanguageProperty(parsed_text.name, hit.name));
  }

  // if no parsed_text check the full unparsed text value
  return(checkLanguageProperty(text, hit.name));
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
      (!check.assigned(hit.address_parts) ||
      (check.assigned(hit.address_parts) && !check.assigned(hit.address_parts.number)))) {
    return 0;
  }
  return 1;
}

/**
 * Determine the quality of the property match
 *
 * @param {string|number} textProp
 * @param {string|number|undefined|null} hitProp
 * @param {boolean} numeric
 * @returns {number}
 */
function propMatch(textProp, hitProp, numeric) {

  // missing information is not quite as bad as totally wrong data
  if (!check.assigned(hitProp)) {
    return 0.1;
  }

  // both present
  if (numeric) {
    if(textProp === hitProp) {
      // handle exact match before dropping all but numeric part
      return 1.0;
    }
    var n1 = parseInt(textProp);
    var n2 = parseInt(hitProp);
    if (!isNaN(n1) && !isNaN(n2)) {
      return Math.sqrt(0.9/(1.0 + Math.abs(n1-n2)));
    }
  }

  return fuzzy.match(textProp.toString(), hitProp.toString());
}

// array wrapper for function above
function propMatchArray(text, hitProp, numeric) {
  if (Array.isArray(hitProp)) { // check all array values
    var count = hitProp.length;
    var maxMatch = 0;
    for (var i=0; i<count; i++) {
      var match = propMatch(text, hitProp[i], numeric);
      if (match>maxMatch) {
        maxMatch=match;
      }
    }
    return maxMatch;
  } else {
    return propMatch(text, hitProp, numeric);
  }
}


/**
 * Check a defined parts of the parsed text address
 * against the results
 *
 * @param {object} text
 * @param {object} hit
 * @param {string} key
 */
function checkAddressPart(text, hit, key) {
  var value;
  var part = confidenceAddressParts[key];
  var parent = hit[part.parent];

  if (!parent) {
    value = null;
  } else {
    value = parent[part.field];
  }
  var score = propMatchArray(text[key], value, part.numeric);

  if(key==='street' && hit.name) { // special case: proper version can be stored in the name
    var _score = checkLanguageProperty(text[key], hit.name, true);
    if(_score>score) {
      score = _score;
    }
  }
  logger.debug('address component match for ' + key, score);

  return score;
}


/**
 * Check admin properties against parsed values
 *
 * @param {values} text/array
 * @param {object} hit
 * @param {object} [hit.parent]
 * @returns {number}
 */
function checkAdmin(values, hit) {
  if (!Array.isArray(values)) {
    values = [values];
  }

  // loop trough configured properties to find best match
  var bestMatch = 0;

  var updateBest = function(text) {
    var match = fuzzy.matchArray(text, values);
    if (match>bestMatch) {
      bestMatch = match;
    }
  };

  adminProperties.forEach( function(key) {
    var prop = hit.parent[key];
    if (prop) {
      if (Array.isArray(prop)) {
        prop.forEach(updateBest);
      } else {
        updateBest(prop);
      }
    }
  });
  return bestMatch;
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
function checkRegions(text, hit) {
  var regions = [];
  var source = text.regions;

  for(var i=1; i<source.length; i++) { // drop 1st entry = actual name or street
    regions.push(source[i]);
  }

  var bestMatch = checkAdmin(regions, hit);
  logger.debug('admin match', bestMatch);

  return bestMatch;
}

/**
 * Check city of the parsed text against a result.
 *
 * @param {string} city
 * @param {object} hit
 * @param {object} [hit.parent]
 * @returns {number}
 */
function checkCity(city, hit) {

  var bestMatch = checkAdmin(city, hit);
  logger.debug('city match', bestMatch);

  return bestMatch;
}


module.exports = setup;
