const Tokenizer = require('pelias-parser/tokenization/Tokenizer');
const Solution = require('pelias-parser/solver/Solution');
const AddressParser = require('pelias-parser/parser/AddressParser');
const parser = new AddressParser();
const _ = require('lodash');

/**
  this module provides fulltext parsing using the pelias/parser module.
  see: https://github.com/pelias/parser

  'pelias parser' provides the following fields:
  'name',
  'housenumber', 'street', 'postcode',
  'locality', 'region', 'country',
  'admin_parts'
**/

// validate texts, convert types and apply defaults
function _sanitize (raw, clean) {
  // error & warning messages
  var messages = { errors: [], warnings: [] };

  // invalid input 'text'
  const text = _.trim(raw.text);
  if (!_.isString(text) || _.isEmpty(text)) {
    messages.errors.push('invalid param \'text\': text length, must be >0');
  }

  // valid input 'text'
  else {
    // parse text with pelias/parser
    clean.text = text;
    clean.parser = 'pelias';
    clean.parsed_text = parse(clean);
  }

  return messages;
}

function parse (clean) {
  // parse text
  const t = new Tokenizer(clean.text);
  parser.classify(t);
  parser.solve(t);

  // only use the first solution generated
  // @todo: we could expand this in the future to accomodate more solutions
  let solution = new Solution();
  if (t.solution.length) { solution = t.solution[0]; }

  // 1. map the output of the parser in to parsed_text
  let parsed_text = {};

  solution.pair.forEach(p => {
    let field = p.classification.label;

    // handle intersections
    if (field === 'street') {
      field = (!parsed_text.street) ? 'street' : 'cross_street';
    }

    // set field
    parsed_text[field] = p.span.body;
  });

  // 2. find any unclassified characters:

  // generate a classification mask, eg:
  // 'Foo Cafe 10 Main St London 10010 Earth'
  // '         NN SSSSSSS AAAAAA PPPPP      '
  let mask = solution.mask(t);

  // the entire input text as seen by the parser with any postcode classification(s) removed
  let body = t.span.body.split('')
    .map((c, i) => (mask[i] !== 'P') ? c : ' ')
    .join('');

  // scan through the input text and 'bucket' characters in to one of two buckets:
  // prefix: all unparsed characters that came before any parsed fields
  // postfix: all unparsed characters from the first admin field to the end of the string

  // set cursor to the first classified character
  let cursor = mask.search(/\S/);
  if (cursor === -1) { cursor = body.length; }
  let prefix = _.trim(body.substr(0, cursor), ' ,');

  // set cursor to the first character of the first classified admin field
  cursor = mask.indexOf('A');
  if (cursor === -1) { cursor = body.length; }
  let postfix = _.trim(body.substr(cursor), ' ,');

  // clean up spacing around commas
  prefix = prefix.split(/[,\n\t]/).join(', ');
  postfix = postfix.split(/[,\n\t]/).join(', ');

  // squash multiple adjacent whitespace characters into a single space
  prefix = prefix.replace(/\s\s+/g, ' ').trim();
  postfix = postfix.replace(/\s\s+/g, ' ').trim();

  // handle the case where 'parsed_text' is completely empty
  // ie. the parser was not able to classify anything at all
  // note: this is common for venue names
  if (Object.keys(parsed_text).length === 0) {
    if (prefix.length && !postfix.length) {
      // if the prefix contains a comma
      // then only use the first part for the prefix for the
      // name and use the remaining tokens for the postfix
      // eg. 'Friendly Cafe, Footown'
      // note: this is how the old 'naive' parser worked
      let split = prefix.split(',');
      if (split.length > 1) {
        prefix = split[0].trim();
        postfix = split.slice(1).join(', ').trim();
      }
    }
  }

  // 3. store the unparsed characters in fields which can be used for querying
  if (prefix.length) { parsed_text.name = prefix; }
  if (postfix.length) { parsed_text.admin_parts = postfix; }

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
