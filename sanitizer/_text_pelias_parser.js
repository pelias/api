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
  // '    VVVV NN SSSSSSS AAAAAA PPPPP      '
  let mask = solution.mask(t);

  // special handling of intersection queries
  // here we do not trust intersection parses which also contain another
  // classification, such as a house number, postcode or admin field.
  // this is to avoid errors for queries such as:
  // eg 'air & space museum, washington, dc'
  //if (parsed_text.street && parsed_text.cross_street) {
    //if (Object.keys(parsed_text).length > 3) {
      //delete parsed_text.street;
      //delete parsed_text.cross_street;
      //mask = mask.replace(/S/g, ' ');
    //}
  //}

  // the entire input text as seen by the parser with any postcode classification(s) removed
  let body = t.span.body.split('')
    .map((c, i) => (mask[i] !== 'P') ? c : ' ')
    .join('');

  // scan through the input text and 'bucket' characters in to one of two buckets:
  // prefix: all unparsed characters that came before any parsed fields
  // postfix: all characters from the first admin field to the end of the string

  // set cursor to the first classified character from selected classes
  let cursor = mask.search(/[NSAP]/);

  // >> solution includes venue classification
  // set cursor after the venue name
  if (mask.includes('V')) { cursor = mask.lastIndexOf('V') +1; }

  if (cursor === -1) { cursor = body.length; }
  let prefix = _.trim(body.substr(0, cursor), ' ,');

  // solution includes address classification
  // set cursor after the last classified address character
  if (mask.search(/[NS]/) > -1) {
    cursor = Math.max(mask.lastIndexOf('N'), mask.lastIndexOf('S')) + 1;
  }
  // solution includes admin classification
  // set cursor to the first classified admin character
  else if( mask.includes('A') ){ cursor = mask.indexOf('A'); }
  // >> solution includes venue classification
  // set cursor after the venue name
  else if (mask.includes('V')) { cursor = mask.lastIndexOf('V') + 1; }
  // else set cursor to end-of-text
  else { cursor = body.length; }
  let postfix = _.trim(body.substr(cursor), ' ,');

  // clean up spacing around commas
  prefix = prefix.split(/[,\n\t]/).join(', ');
  postfix = postfix.split(/[,\n\t]/).join(', ');

  // handle the case where 'parsed_text' is completely empty
  // ie. the parser was not able to classify anything at all
  // note: this is common for venue names
  // note: length == 1 accounts for 'subject'
  if (Object.keys(parsed_text).length === 1) {
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

  // squash multiple adjacent whitespace characters into a single space
  prefix = prefix.replace(/\s+/g, ' ').trim();
  postfix = postfix.replace(/\s+/g, ' ').trim();

  // 3. store the unparsed characters in fields which can be used for querying
  // if (prefix.length) { parsed_text.name = prefix; }
  if (postfix.length) { parsed_text.admin = postfix; }

  // 4. set 'subject', this is the text which will target the 'name.*'
  // fields in elasticsearch queries

  // an address query
  if (!_.isEmpty(parsed_text.housenumber) && !_.isEmpty(parsed_text.street)) {
    parsed_text.subject = `${parsed_text.housenumber} ${parsed_text.street}`;
  }
  // an intersection query
  else if (!_.isEmpty(parsed_text.street) && !_.isEmpty(parsed_text.cross_street)) {
    parsed_text.subject = `${parsed_text.street} & ${parsed_text.cross_street}`;
  }
  // a street query
  else if (!_.isEmpty(parsed_text.street)) {
    parsed_text.subject = parsed_text.street;
  }
  // query with a $prefix such as a venue query
  else if (!_.isEmpty(prefix)){
    parsed_text.subject = prefix;
  }
  // a postcode query
  else if (!_.isEmpty(parsed_text.postcode)) {
    parsed_text.subject = parsed_text.postcode;
  }
  // a locality query
  else if (!_.isEmpty(parsed_text.locality)) {
    parsed_text.subject = parsed_text.locality;

    // remove the locality name from $admin
    if ( parsed_text.admin ) {
      let width = parsed_text.subject.length;
      let cut = parsed_text.admin.substr(0, width);
      if( cut === parsed_text.subject ){
        parsed_text.admin = _.trim(parsed_text.admin.substr(width), ', ');
        if( !parsed_text.admin.length ){ delete parsed_text.admin; }
      }
    }
  }
  // a region query
  else if (!_.isEmpty(parsed_text.region)) {
    parsed_text.subject = parsed_text.region;

    // remove the region name from $admin
    if (parsed_text.admin) {
      let width = parsed_text.subject.length;
      let cut = parsed_text.admin.substr(0, width);
      if (cut === parsed_text.subject) {
        parsed_text.admin = _.trim(parsed_text.admin.substr(width), ', ');
        if( !parsed_text.admin.length ){ delete parsed_text.admin; }
      }
    }
  }
  // a country query
  else if (!_.isEmpty(parsed_text.country)) {
    parsed_text.subject = parsed_text.country;

    // remove the country name from $admin
    if (parsed_text.admin) {
      let width = parsed_text.subject.length;
      let cut = parsed_text.admin.substr(0, width);
      if (cut === parsed_text.subject) {
        parsed_text.admin = _.trim(parsed_text.admin.substr(width), ', ');
        if (!parsed_text.admin.length) { delete parsed_text.admin; }
      }
    }
  }
  
  // unknown query type
  else {
    parsed_text.subject = t.span.body;
  }

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
