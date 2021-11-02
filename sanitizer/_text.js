const _ = require('lodash');
const unicode = require('../helper/unicode');
const MAX_TEXT_LENGTH = 140;

// ref: https://en.wikipedia.org/wiki/Quotation_mark
const QUOTES = `"'«»‘’‚‛“”„‟‹›⹂「」『』〝〞〟﹁﹂﹃﹄＂＇｢｣`;

// validate texts, convert types and apply defaults
function _sanitize( raw, clean ){

  // error & warning messages
  const messages = { errors: [], warnings: [] };

  // normalize unicode marks
  let text = unicode.normalize(raw.text);

  // remove superfluous whitespace and quotes
  text = _.trim(_.trim(text), QUOTES);

  // validate input 'text'
  if( !_.isString(text) || _.isEmpty(text) ){
    messages.errors.push(`invalid param 'text': text length, must be >0`);
  } else {
    if( text.length > MAX_TEXT_LENGTH ){
      messages.warnings.push(`param 'text' truncated to ${MAX_TEXT_LENGTH} characters`);
      text = text.substring(0, MAX_TEXT_LENGTH);
    }
    clean.text = text;
  }

  return messages;
}

function _expected(){
  return [{ name: 'text' }];
}
// export function
module.exports = () => ({
  sanitize: _sanitize,
  expected: _expected
});
