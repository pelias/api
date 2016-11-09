var _ = require('lodash');

var fields = ['query', 'address', 'neighbourhood', 'city',
    'county', 'state', 'postalcode', 'country'];

function normalizeWhitespaceToSingleSpace(val) {
  return _.replace(_.trim(val), /\s+/g, ' ');
}

function sanitize( raw, clean ){

  // error & warning messages
  var messages = { errors: [], warnings: [] };

  // collect all the valid values into a single object
  clean.parsed_text = fields.reduce( (o, f) => {
    if (_.isString(raw[f]) && !_.isEmpty(_.trim(raw[f]))) {
      o[f] = normalizeWhitespaceToSingleSpace(raw[f]);
    }

    return o;

  }, {});

  if (_.isEmpty(Object.keys(clean.parsed_text))) {
    messages.errors.push('at least one of the following fields is required: ' +
      'query, address, neighbourhood, city, county, state, postalcode, country');
  }

  return messages;
}

// export function
module.exports = sanitize;
