const logger = require('pelias-logger').get('api');
const unicode = require('../helper/unicode');
const Tokenizer = require('pelias-parser/tokenization/Tokenizer');
const Solution = require('pelias-parser/solver/Solution');
const AddressParser = require('pelias-parser/parser/AddressParser');
const parser = new AddressParser();
const _ = require('lodash');
const MAX_TEXT_LENGTH = 140;

// this constant defines a lower boundary for the solution score returned
// by the Pelias parser. Any solutions which scored lower than this value
// will simply have their entire body returned as the $subject
const MIN_ACCEPTABLE_SCORE = 0.3;

// this constant defines the minimum amount of characters that can be
// interpreted as a $prefix when assigning them to $subject.
// this is useful for cases such as 'St Francis' where the parser returns
// { locality: 'Francis' }, it's not able to classify the 'St' token.
// in this case the leading 'St' would normally be considered the $subject
// and the parsed_text would be { subject: 'St', admin: 'Francis' }.
// the $MIN_PREFIX_CHAR_LENGTH var is a simple way of working around this problem.
const MIN_PREFIX_CHAR_LENGTH = 3;

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

/**
  The Pelias parser is responsible for interpreting an input string and then returning
  one or more solutions for how the input tokens can been logically classified.

  However, the responsibility of *how* to interpret those solutions and how best
  to map them to variables we can use to query elasticsearch is the responsibility
  of the function below.

  The general idea is to split tokens along a 'cursor boundary', so on the left side of
  the cursor we have the 'subject' of the query (ie. the place in question) and on the
  right side of the query we have the administrative tokens.

  note: The function below is *only* concerned with selecting $parsed_text.subject and
  $parsed_text.admin values

  see: `query/text_parser_pelias.js` for the logic which adds the other fields such
  as $parsed_text.housenumber and $parsed_text.street etc. *before* this gets run.

  Postcodes are a special case, they belong to neither the admin hierarchy nor to the
  subject itself. They are more similar in that sense to a house number, because they
  are a property of the address. They are tricky because they usually appear somewhere
  in the middle of the input text. They shouldn't be included in either the subject or
  the admin parts, unless the postcode is itself the subject of the query.

  Here are some examples of how we might split a query into subject and admin:
  "100 Foo Street Brookyln NYC" -> ["100 Foo Street", "Brookyln NYC"]
  "Foo Bar 10017 Berlin Germany" -> ["Foo Bar", "Berlin Germany"]
 */
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

  // 1. map the output of the parser into $parsed_text
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

  // the entire input text as seen by the parser with any postcode and unit
  // classification(s) removed
  let body = t.span.body.split('')
    .map((c, i) => !/[PU]/.test(mask[i]) ? c : ' ')
    .join('');

  // same as $body above but with consecutive whitespace squashed and trimmed.
  const normalizedBody = t.section.map(sp => sp.body).join(' ').replace(/\s+/g, ' ').trim();

  // scan through the input text and 'bucket' characters in to one of two buckets:
  // prefix: all unparsed characters that came before any parsed fields
  // postfix: all characters from the first admin field to the end of the string

  // set cursor to the first classified character from selected classes
  let cursor = mask.search(/[NSAP]/);

  // if solution includes address classification
  // set cursor after the last classified address character
  if ( mask.includes('N') && mask.includes('S') ) {
    cursor = Math.max(mask.lastIndexOf('N'), mask.lastIndexOf('S')) + 1;
  }

  // else if solution includes admin classification
  // set cursor to the first classified admin character
  else if( mask.includes('A') ){ cursor = mask.indexOf('A'); }

  // else set cursor to end-of-text
  else { cursor = body.length; }

  if (cursor === -1) { cursor = body.length; }
  let prefix = _.trim(body.substr(0, cursor), ' ,');
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

  // in the case where the solution score is very low we simply use the entire
  // input as the $subject.
  if ( solution.score < MIN_ACCEPTABLE_SCORE ) {
    parsed_text = { subject: normalizedBody };
  }
  // an address query
  else if (!_.isEmpty(parsed_text.housenumber) && !_.isEmpty(parsed_text.street)) {
    parsed_text.subject = `${parsed_text.housenumber} ${parsed_text.street}`;
  }
  // an intersection query
  else if (!_.isEmpty(parsed_text.street) && !_.isEmpty(parsed_text.cross_street)) {
    parsed_text.subject = `${parsed_text.street} & ${parsed_text.cross_street}`;
  }
  // a street query
  else if (!_.isEmpty(parsed_text.street) && _.isEmpty(parsed_text.venue)) {
    parsed_text.subject = parsed_text.street;
  }
  // query with a $prefix such as a venue query
  else if (!_.isEmpty(prefix)){
    if (prefix.length >= MIN_PREFIX_CHAR_LENGTH) {
      parsed_text.subject = prefix;
    } else {
      parsed_text = { subject: normalizedBody };
    }
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
    parsed_text = { subject: normalizedBody };
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
