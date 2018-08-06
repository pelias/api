const check = require('check-types');
const _ = require('lodash');

// ref: https://en.wikipedia.org/wiki/Quotation_mark
const QUOTES = `"'«»‘’‚‛“”„‟‹›⹂「」『』〝〞〟﹁﹂﹃﹄＂＇｢｣`;

// validate texts, convert types and apply defaults
function _sanitize( raw, clean ){

  // error & warning messages
  const messages = { errors: [], warnings: [] };

  // invalid input 'text'
  // must call `!check.nonEmptyString` since `check.emptyString` returns
  //  `false` for `undefined` and `null`
  const text =  _.trim( _.trim( raw.text ), QUOTES );

  if( !check.nonEmptyString( text ) ){
    messages.errors.push('invalid param \'text\': text length, must be >0');
  } else {
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
