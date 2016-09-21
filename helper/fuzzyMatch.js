
var fuzzy = require('fuzzy.js');
var logger = require('pelias-logger').get('api:fuzzy');

function normalizeName(text) {
  return text.toLowerCase();
}

function removeNumbers(val) {
  return val.replace(/[0-9]/g, '').trim();
}

/* returns 1.0 only when strings are identical
   Totally different strings return 0.
   Original fuzzyjs prefers strings with a similar start.
   Here that limitation is cured by evaluating score from
   direct substring match. For example, 'citymarket' is not a bad
   match with 'k-citymarket' or even with 'turtolan k-citymarket'.
   Hopefully a proper fuzzy match library will be found.
   Meanwhile, we patch the worst faults ourselves.
*/

function _fuzzyMatch(text1, text2) {
  var len1 = text1.length;
  var len2 = text2.length;

  var score = fuzzy(text1, text2).score;
  var score2;

  if (len1>len2) {
    score = score/fuzzy(text1, text1).score;
    if(text1.indexOf(text2)!==-1) {
      score2 = len2/len1;
    }
  } else {
    score = score/fuzzy(text2, text2).score;
    if(text2.indexOf(text1)!==-1) {
      score2 = len1/len2;
    }
  }
  if (score2 && score2>score) {
    return score2;
  }

  return score;
}

// matching which takes word order into account
function fuzzyMatch(text1, text2) {
  text1 = normalizeName(text1);
  text2 = normalizeName(text2);

  // straight match as a whole string
  var score = _fuzzyMatch(text1, text2);

  // consider change of order e.g. Citymarket turtola | Turtolan citymarket
  // In normal text, change of order can be very significant. With addresses,
  // order does not matter that much.
  var words1 = text1.split(' ');
  var words2 = text2.split(' ');

  if(words1.length>1 || words2.length>1) {
    if(words1.length>words2.length) {
      var temp = words1;
      words1 = words2;
      words2 = temp;
    }
    var wordScore=0;
    var weightSum=0;
    var matched=[];
    words1.forEach(function(word1) {
      var bestScore=0, bestIndex;
      for(var wi in words2) {
        var wscore = _fuzzyMatch(word1, words2[wi]);
        if (wscore>bestScore) {
          bestScore=wscore;
          bestIndex = wi;
        }
      }
      var l = word1.length;
      wordScore += l*bestScore; // weight by word len
      weightSum += l;
      matched[bestIndex]=true;
    });

    // extra words just accumulate weight, not score
    for (var wi2 in words2) {
      if (!matched[wi2]) {
        weightSum += words2[wi2].length;
      }
    }
    wordScore /= weightSum;
    if(wordScore>score) {
      return wordScore;
    }
  }
  return score;
}

module.exports = fuzzyMatch;
