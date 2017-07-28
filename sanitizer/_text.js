const check = require('check-types');
const _ = require('lodash');

// validate texts, convert types and apply defaults
function _sanitize( raw, clean ){

  // error & warning messages
  const messages = { errors: [], warnings: [] };

  // invalid input 'text'
  // must call `!check.nonEmptyString` since `check.emptyString` returns
  //  `false` for `undefined` and `null`
  if( !check.nonEmptyString( raw.text ) ){
    messages.errors.push('invalid param \'text\': text length, must be >0');

  } else {
    clean.text = raw.text;

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
