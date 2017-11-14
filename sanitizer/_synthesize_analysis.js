const _ = require('lodash');

const fields = {
  'venue': 'query',
  'address': 'address',
  'neighbourhood': 'neighbourhood',
  'borough': 'borough',
  'locality': 'city',
  'county': 'county',
  'region': 'state',
  'postalcode': 'postalcode',
  'country': 'country'
};

function normalizeWhitespaceToSingleSpace(val) {
  return _.replace(_.trim(val), /\s+/g, ' ');
}

function _sanitize( raw, clean ){

  // error & warning messages
  const messages = { errors: [], warnings: [] };

  // collect all the valid values into a single object
  clean.parsed_text = Object.keys(fields).reduce( (o, f) => {
    if (_.isString(raw[f]) && !_.isEmpty(_.trim(raw[f]))) {
      o[fields[f]] = normalizeWhitespaceToSingleSpace(raw[f]);
    }

    return o;

  }, {});

  if (_.isEmpty(Object.keys(clean.parsed_text))) {
    messages.errors.push(
      `at least one of the following fields is required: ${Object.keys(fields).join(', ')}`);
  }

  return messages;

}

function _expected() {
  return [
    { 'name': 'venue' },
    { 'name': 'address' },
    { 'name': 'neighbourhood' },
    { 'name': 'borough' },
    { 'name': 'locality' },
    { 'name': 'county' },
    { 'name': 'region' },
    { 'name': 'postalcode' },
    { 'name': 'country' }];
}
// export function
module.exports = () => ({
  sanitize: _sanitize,
  expected: _expected
});
