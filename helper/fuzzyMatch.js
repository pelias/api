var fuzzy = require('fuzzy.js');

function normalizeName(text) {
  return text.toLowerCase().trim();
}

/* returns 1.0 only when strings are identical
   Totally different strings return 0.
   Match prefers strings with a similar start
*/

function fuzzyMatch(text1, text2) {
  var ltext1 = normalizeName(text1);
  var len1 = ltext1.length;

  var ltext2 = normalizeName(text2);
  var len2 = ltext2.length;

  var score = fuzzy(ltext1, ltext2).score;
  if (len1>len2) {
    return score/fuzzy(ltext1, ltext1).score;
  } else {
    return score/fuzzy(ltext2, ltext2).score;
  }
}

module.exports = fuzzyMatch;
