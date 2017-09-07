const _ = require('lodash');
const iso3166 = require('iso3166-1');
const util = require('../util/arrayHelper');

/*
this function returns an object that denotes an intersection of form:
{
  street1: value1,
  street2: value2
}
*/
function parseIntersections(text) {
    var str1 = '', str2 = '';
    if(text.trim().length > 1) {
         var words = text.toLowerCase().split(' ');
         // remove all the whitespaces
         words = util.removeWhitespaceElements(words);
         words = util.EWStreetsSanitizer(words);
         words = util.addOrdinality(words);
         // only treat input as intersection if contains '&' or 'and'
         const delimiter = _.includes(text, '&') ? '&' : 'and';
         const delimiterIndex = words.indexOf(delimiter);

         str1 = util.wordsToSentence(words, 0, delimiterIndex);
         str2 = util.wordsToSentence(words, delimiterIndex+1, words.length);
    } else {
      throw 'Missing streets in the intersection';
    }
    return { street1: str1, street2: str2 };
}

function setup(should_execute) {
  function controller( req, res, next ){
    // bail early if req/res don't pass conditions for execution
    if (!should_execute(req, res)) {
      return next();
    }

    // parse text with query parser
    //const parsed_text = text_analyzer.parse(req.clean.text);
    const parsed_text = parseIntersections(req.clean.text);

    if (parsed_text !== undefined) {
      // if a known ISO2 country was parsed, convert it to ISO3
      if (_.has(parsed_text, 'country') && iso3166.is2(_.toUpper(parsed_text.country))) {
        parsed_text.country = iso3166.to3(_.toUpper(parsed_text.country));
      }

      req.clean.parsed_text = parsed_text;
    }

    return next();

  }

  return controller;
}

module.exports = setup;
