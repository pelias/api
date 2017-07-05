const check = require('check-types');
const text_analyzer = require('pelias-text-analyzer');
const _ = require('lodash');

// validate texts, convert types and apply defaults
function sanitize( raw, clean ){
  // error & warning messages
  const messages = { errors: [], warnings: [] };

  // invalid input 'text'
  // must call `!check.nonEmptyString` since `check.emptyString` returns
  //  `false` for `undefined` and `null`
  if( !check.nonEmptyString( raw.text ) ){
    messages.errors.push('invalid param \'text\': text length, must be >0');

  } else {
    clean.text = raw.text;

    // only call libpostal if there are other sources besides whosonfirst
    //  since placeholder will take care of it later
    if (!_.isEqual(clean.sources, ['whosonfirst'])) {
      // parse text with query parser
      const parsed_text = text_analyzer.parse(clean.text);
      if (check.assigned(parsed_text)) {
        clean.parsed_text = parsed_text;
      }
    }

  }

  return messages;
}

// export function
module.exports = sanitize;
