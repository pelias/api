
var check = require('check-types');

/**
  simplified version of the elaticsearch tokenizer, used in order to
  be able to detect which tokens are 'complete' (user has finished typing them)
  or 'incomplete' (the user has possibly only typed part of the token).

  note: we don't need to strip punctuation as that will be handled on the
  elasticsearch side, so sending a token such as 'st.' is not an issue, these
  tokens should *not* be modified as the anaylsis can use the punctuation to
  infer meaning.

  note: this sanitizer should run *after* the '_text' sanitizer so it can
  use the output of clean.parsed_text where available.
**/
function _sanitize( raw, clean ){

  // error & warning messages
  var messages = { errors: [], warnings: [] };

  // this is the string we will use for analysis
  var text = clean.text;

  // a boolean to track whether the input parser successfully ran; or not.
  var inputParserRanSuccessfully = false;

  // if the text parser has run then we only tokenize the 'name' section
  // of the 'parsed_text' object, ignoring the 'admin' parts.
  if( clean.hasOwnProperty('parsed_text') ) {
    inputParserRanSuccessfully = true;

    // parsed_text.name is set, this is the highest priority, use this string
    if( clean.parsed_text.hasOwnProperty('name') ){
      text = clean.parsed_text.name; // use this string instead
    }

    // else handle the case where parsed_text.street was produced but
    // no parsed_text.name is produced.
    // additionally, handle the case where parsed_text.number is present
    // note: the addressit module may also produce parsed_text.unit info
    // for now, we discard that information as we don't have an appropriate
    else if( clean.parsed_text.hasOwnProperty('street') ){
      text = [
        clean.parsed_text.number,
        clean.parsed_text.street
      ].filter(function(el){return el;})
      .join(' '); // remove empty elements
    }
  }

  // always set 'clean.tokens*' arrays for consistency and to avoid upstream errors.
  clean.tokens = [];
  clean.tokens_complete = [];
  clean.tokens_incomplete = [];

  // sanity check that the text is valid.
  if( check.nonEmptyString( text ) ){

    // split according to the regex used in the elasticsearch tokenizer
    // see: https://github.com/pelias/schema/blob/master/settings.js
    // see: settings.analysis.tokenizer.peliasNameTokenizer
    clean.tokens = text
      .split(/[\s,\\\/]+/) // split on delimeters
      .filter(function(el){return el;}); // remove empty elements
  }

  /**
    the following section splits the tokens in to two arrays called
    'tokens_complete' and 'tokens_incomplete'.

    it also strips any tokens from 'tokens_incomplete' which might not
    match the ngrams index (such as single grams not stored in the index).
  **/

  // split the tokens in to 'complete' and 'incomplete'.
  if( clean.tokens.length ){

    // if all the tokens are complete, simply copy them from clean.tokens
    if( inputParserRanSuccessfully ){

      // all these tokens are complete!
      clean.tokens_complete = clean.tokens.slice();

    // user hasn't finished typing yet
    } else {

      // make a copy of the tokens and remove the last element
      var tokensCopy = clean.tokens.slice(),
          lastToken = tokensCopy.pop();

      // set all but the last token as 'complete'
      clean.tokens_complete = tokensCopy;

      if( lastToken ){
        clean.tokens_incomplete = [ lastToken ];
      }
    }

  }

  return messages;
}

// export function
module.exports = () => ({
  sanitize: _sanitize
});
