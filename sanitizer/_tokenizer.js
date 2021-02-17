const _ = require('lodash');

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
  var parserConsumedAllTokens = false;

  // if the text parser has run then we only tokenize the 'subject' section
  // of the 'parsed_text' object, ignoring the 'admin' parts.
  if( _.isPlainObject(clean, 'parsed_text') && !_.isEmpty(clean.parsed_text) ) {
    // parsed_text.subject is set, this is the highest priority, use this string
    if( _.has(clean.parsed_text, 'subject') ){
      text = clean.parsed_text.subject; // use this string instead

      // note: we cannot be sure that the input is complete if a street is
      // detected because the parser will detect partially completed suffixes
      // which are not safe to match against a phrase index
      if( _.has(clean.parsed_text, 'street') ){
        parserConsumedAllTokens = false;
      }

      // when $subject is not the end of $clean.text
      // then there must be tokens coming afterwards
      else if (!clean.text.endsWith(text)) {
        parserConsumedAllTokens = true;
      }
    }
  }

  // if requesting the address layer AND final character is a numeral then consider
  // all tokens as complete in order to avoid prefix matching numerals.
  if ( _.get(clean, 'layers', []).includes('address') ) {
    if ( /[0-9]$/.test(text) ) {
      parserConsumedAllTokens = true;
    }
  }

  // always set 'clean.tokens*' arrays for consistency and to avoid upstream errors.
  clean.tokens = [];
  clean.tokens_complete = [];
  clean.tokens_incomplete = [];

  // sanity check that the text is valid.
  if( _.isString(text) && !_.isEmpty(text) ){

    // split according to the regex used in the elasticsearch tokenizer
    // see: https://github.com/pelias/schema/blob/master/settings.js
    // see: settings.analysis.tokenizer.peliasNameTokenizer
    clean.tokens = text
      .split(/[\s,\\\/]+/) // split on delimeters
      .filter(el => el); // remove empty elements
  } else {
    // text is empty, this sanitizer should be a no-op
    return messages;
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
    if( parserConsumedAllTokens ){

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

  } else {
    // set error if no substantial tokens were found
    messages.errors.push('invalid `text` input: must contain more than just delimiters');
  }

  return messages;
}

// export function
module.exports = () => ({
  sanitize: _sanitize
});
