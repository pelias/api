const _ = require('lodash');

const fields = {
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

function isPostalCodeOnly(parsed_text) {
  return Object.keys(parsed_text).length === 1 &&
          parsed_text.hasOwnProperty('postalcode');
}

function sanitize( raw, clean ){

  // error & warning messages
  const messages = { errors: [], warnings: [] };

  // collect all the valid values into a single object
  clean.parsed_text = Object.keys(fields).reduce( (o, f) => {
    if (_.isString(raw[f]) && !_.isEmpty(_.trim(raw[f]))) {
      o[fields[f]] = normalizeWhitespaceToSingleSpace(raw[f]);
    }

    return o;

  }, {});

  if (isPostalCodeOnly(clean.parsed_text)) {
    messages.errors.push('postalcode-only inputs are not supported');
  }
  else if (_.isEmpty(Object.keys(clean.parsed_text))) {
    messages.errors.push(
      `at least one of the following fields is required: ${Object.keys(fields).join(', ')}`);
  }

  return messages;
}

// export function
module.exports = sanitize;
