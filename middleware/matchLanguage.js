/**
 *  Modify language preference by actual search results.
 *
 *  Explanation: Pelias is not a translation service. If the user searches for a
 *  Swedish version of a name in Finland, return swedish even if she has forgotten
 *  (or not realized to change) the language parameter in the client app. Language
 *  parameter is just a faint hint of preferences - the actual search string
 *  truly shows what is wanted.
 *
 *  Language selection priority:
 *
 *  1. Best match
 *  2. Api 'lang' parameter or 'default' if not given
 *  3. Peliasconfig 'languages' list order
 */

var fuzzy = require('fuzzy.js');
var logger = require('pelias-logger').get('api');
var languages = ['default'];
var languageMatchThreshold = 0.7;

function setup(peliasConfig) {
  peliasConfig = peliasConfig || require('pelias-config').generate().api;

  if(peliasConfig) {
    languages = peliasConfig.languages || languages;
    languageMatchThreshold = peliasConfig.languageMatchThreshold || languageMatchThreshold;
  }
  return matchLanguage;
}

function removeNumbers(val) {
  return val.replace(/[0-9]/g, '').trim();
}

function matchLanguage(req, res, next) {

  // do nothing if no result data set
  if (!res || !res.data || !res.data[0]) {
    return next();
  }

  if (!req.clean || !req.clean.text) {
    return next();   // nothing to match
  }

  var currentLang = req.clean.lang; // default preference

  var name; // searched name
  if (req.clean.parsed_text && req.clean.parsed_text.name) {
    name = req.clean.parsed_text.name;
  } else {
    name = req.clean.text;
  }
  // fix street/number order problem by stripping the number part
  name = removeNumbers(name);

  // match name versions of 1st search result with the searched name
  var names = res.data[0].name; // use 1st hit from ES = best match so far

  var bestLang;
  var bestScore = -1;
  var fullScore = fuzzy(name, name).score;

  var matchLang = function(lang) { // compute matching score
    var name2 = removeNumbers(names[lang]);
    return fuzzy(name, name2).score;
  };

  var updateBest = function(lang, score) {
      bestScore = score;
      bestLang = lang;
  };

  for(var lang in names) {
    var score = matchLang(lang);
    if (score > bestScore ) {
      updateBest(lang, score);
    }
    else if (score === bestScore && bestLang !== currentLang) {
      // explicit lang parameter has 2nd highest priority
      if (lang === currentLang) {
	updateBest(lang, score);
      }
      else {
	// judge by configured language list priority
	var i1 = languages.indexOf(lang);
	var i2 = languages.indexOf(bestLang);
	if (i1 !== -1 && (i2 === -1 ||  i1 < i2)) {
	  updateBest(lang, score);
	}
      }
    }
  }
  // change lang if best hit is good enough
  if (bestLang && bestScore/fullScore > languageMatchThreshold) {
    // logger.debug('Best match by lang ' + bestLang );
    req.clean.lang = bestLang;
  }
  next();
}

module.exports = setup;
