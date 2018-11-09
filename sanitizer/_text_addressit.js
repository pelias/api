const addressit = require('addressit');
const _      = require('lodash');
const logger = require('pelias-logger').get('api');

/**
  this module provides extremely basic parsing using two methods.

  note: this code is old and well due for a makover/replacement, we
  are not happy with either of these methods but they remain in place
  for purely legacy reasons.

  'naïve parser' provides the following fields:
  'name', 'admin_parts'

  'addressit parser' provides the following fields:
  'unit', 'number', 'street', 'state', 'country', 'postalcode', 'regions'
**/

// ref: https://en.wikipedia.org/wiki/Quotation_mark
const QUOTES = `"'«»‘’‚‛“”„‟‹›⹂「」『』〝〞〟﹁﹂﹃﹄＂＇｢｣`;
const DELIM = ',';
const ADDRESSIT_MIN_CHAR_LENGTH = 4;

// validate texts, convert types and apply defaults
function _sanitize( raw, clean ){

  // error & warning messages
  var messages = { errors: [], warnings: [] };

  // invalid input 'text'
  const text =  _.trim( _.trim( raw.text ), QUOTES );
  if( !_.isString(text) || _.isEmpty(text) ){
    messages.errors.push('invalid param \'text\': text length, must be >0');
  }

  // valid input 'text'
  else {

    // parse text with query parser
    clean.text = text;
    clean.parser = 'addressit';
    clean.parsed_text = parse(clean);
  }

  return messages;
}

// naive approach - for admin matching during query time
// split 'flatiron, new york, ny' into 'flatiron' and 'new york, ny'
var naïve = function(tokens) {
  var parsed_text = {};

  if( tokens.length > 1 ){
    parsed_text.name = tokens[0];

    // 1. slice away all parts after the first one
    // 2. trim spaces from each part just in case
    // 3. join the parts back together with appropriate delimiter and spacing
    parsed_text.admin_parts = tokens.slice(1).join(`${DELIM} `);
  }

  return parsed_text;
};

function parse(clean) {

  // split query on delimiter
  var tokens = clean.text.split(DELIM).map( part => part.trim() );

  // call the naïve parser to try and split tokens
  var parsed_text = naïve(tokens);

  // join tokens back togther with normalized delimiters
  var joined = tokens.join(`${DELIM} `);

  // query addressit - perform full address parsing
  // except on queries so short they obviously can't contain an address
  if( joined.length >= ADDRESSIT_MIN_CHAR_LENGTH ) {
    var parsed = addressit(joined);

    // copy fields from addressit response to parsed_text
    for( var attr in parsed ){
      if( 'text' === attr ){ continue; } // ignore 'text'
      if( !_.isEmpty( parsed[ attr ] ) && _.isUndefined( parsed_text[ attr ] ) ){
        parsed_text[ attr ] = parsed[ attr ];
      }
    }
  }

  // if all we found was regions, ignore it as it is not enough information to make smarter decisions
  if( Object.keys(parsed_text).length === 1 && !_.isUndefined(parsed_text.regions) ){
    logger.info('Ignoring address parser output, regions only', {
      parsed: parsed_text,
      params: clean
    });

    // return empty parsed_text
    return {};
  }

  return parsed_text;
}

function _expected(){
  return [{ name: 'text' }];
}

// export function
module.exports = () => ({
  sanitize: _sanitize,
  expected: _expected
});
