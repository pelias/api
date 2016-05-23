/**
 *  Modify language preference by actual search results.
 *
 *  Explanation: Pelias is not a translation service. If the user searches for a
 *  Swedish version of a name in Finland, return swedish even if she has forgotten
 *  (or not realized to change) the language parameter in the client app. Language
 *  parameter is just a faint hint of preferences - the actual search string
 *  truly shows what is wanted.
 */

var fuzzy = require('fuzzy.js');
var logger = require('pelias-logger').get('api');
var languages;

function setup(peliasConfig) {
  if(peliasConfig) {
    languages = peliasConfig.languages;
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
  var bestLang;
  var bestScore=0;
  var fullScore = fuzzy(name, name).score;
  var names = res.data[0].name; // 1st hit from ES = best so far

  for(var lang in names) {
    var name2 = removeNumbers(names[lang]);
    var score = fuzzy(name, name2).score;
    if (score > bestScore ) {
      bestScore = score;
      bestLang = lang;
    } else if (score === bestScore) {
      if (lang === currentLang || lang === 'default' || !bestLang) {
	// favor defaults
	bestScore = score;
	bestLang = lang;
      } else if (languages) {
	//judge by configured priority
	var i1 = languages.indexOf(lang);
	var i2 = languages.indexOf(bestLang);
	if (i1 !== -1 && (i2 === -1 ||  i1 < i2)) {
	  bestScore = score;
	  bestLang = lang;
	}
      }
    }
  }
  // change lang if best hit is good enough
  if (bestLang && bestScore/fullScore > 0.5) {
    // logger.debug('Best match by lang ' + bestLang );
    req.clean.lang = bestLang;
  }
  next();
}

module.exports = setup;
