const _ = require('lodash');
const text_analyzer = require('pelias-text-analyzer');

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

function isPostalCodeOnly(parsed_text) {
  return Object.keys(parsed_text).length === 1 &&
          parsed_text.hasOwnProperty('postalcode');
}

// figure out which field contains the probable house number, prefer number
// libpostal parses some inputs, like `3370 cobbe ave`, as a postcode+street
// so because we're treating the entire field as a street address, it's safe
// to assume that an identified postcode is actually a house number.
function getHouseNumberField(analyzed_address) {
  for (var field of ['number', 'postalcode']) {
    if (analyzed_address.hasOwnProperty(field)) {
      return field;
    }
  }

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

  if (clean.parsed_text.hasOwnProperty('address')) {
    const analyzed_address = text_analyzer.parse(clean.parsed_text.address);

    const house_number_field = getHouseNumberField(analyzed_address);

    // if we're fairly certain that libpostal identified a house number
    // (from either the house_number or postcode field), place it into the
    // number field and remove the first instance of that value from address
    // and assign to street
    // eg - '1090 N Charlotte St' becomes number=1090 and street=N Charlotte St
    if (house_number_field) {
      clean.parsed_text.number = analyzed_address[house_number_field];

      // remove the first instance of the number and trim whitespace
      clean.parsed_text.street = _.trim(_.replace(clean.parsed_text.address, clean.parsed_text.number, ''));

    } else {
      // otherwise no house number was identifiable, so treat the entire input
      // as a street
      clean.parsed_text.street = clean.parsed_text.address;

    }

    // the address field no longer means anything since it's been parsed, so remove it
    delete clean.parsed_text.address;

  }

  return messages;
}

// export function
module.exports = sanitize;
