const logger = require('pelias-logger').get('api');
const unicode = require('../helper/unicode');
const Tokenizer = require('pelias-parser/tokenization/Tokenizer');
const Solution = require('pelias-parser/solver/Solution');
const AddressParser = require('pelias-parser/parser/AddressParser');
const parser = new AddressParser();
const _ = require('lodash');
const MAX_TEXT_LENGTH = 140;

/**
  this module provides fulltext parsing using the pelias/parser module.
  see: https://github.com/pelias/parser

  'pelias parser' provides the following fields:
  'name',
  'housenumber', 'street', 'postcode',
  'locality', 'region', 'country',
  'admin'
**/

// validate texts, convert types and apply defaults
function _sanitize (raw, clean) {
  // error & warning messages
  var messages = { errors: [], warnings: [] };

  // normalize unicode marks
  let text = unicode.normalize(raw.text);

  // remove superfluous whitespace
  text = _.trim(text);

  // validate input 'text'
  if( !_.isString(text) || _.isEmpty(text) ){
    messages.errors.push(`invalid param 'text': text length, must be >0`);
  }

  // valid input 'text'
  else {

    // truncate text to $MAX_TEXT_LENGTH chars
    if (text.length > MAX_TEXT_LENGTH) {
      messages.warnings.push(`param 'text' truncated to ${MAX_TEXT_LENGTH} characters`);
      text = text.substring(0, MAX_TEXT_LENGTH);
    }

    // parse text with pelias/parser
    clean.text = text;
    clean.parser = 'pelias';
    clean.parsed_text = parse(clean);
  }

  return messages;
}

function parse (clean) {
  // parse text
  let start = new Date();
  const t = new Tokenizer(clean.text);
  parser.classify(t);
  parser.solve(t);

  // log summary info
  logger.info('pelias_parser', {
    response_time: (new Date()) - start,
    params: clean,
    solutions: t.solution.length,
    text_length: _.get(clean, 'text.length', 0)
  });

  // only use the first solution generated
  // @todo: we could expand this in the future to accomodate more solutions
  let solution = new Solution();
  if (t.solution.length) { solution = t.solution[0]; }

  // 1. map the output of the parser in to parsed_text
  let parsed_text = { subject: undefined };

  parsed_text.subject = t.span.body;

  return parsed_text;
}

function _expected () {
  return [{ name: 'text' }];
}

// export function
module.exports = () => ({
  sanitize: _sanitize,
  expected: _expected
});
