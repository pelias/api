const _ = require('lodash');
const nonEmptyString = (v) => _.isString(v) && !_.isEmpty(v);
const iso3166 = require('../helper/iso3166');

const _sanitize = (key) => (raw, clean) => {
  // error & warning messages
  const messages = { errors: [], warnings: [] };

  // target input param
  let countries = raw[`${key}.country`];

  // param `*.country` is optional and should not
  // error when simply not set by the user
  if (!_.isNil(countries)) {

    // must be valid string
    if (!nonEmptyString(countries)) {
      messages.errors.push(`${key}.country is not a string`);
    } else {
      // support for multi countries
      countries = countries.split(',').filter(nonEmptyString);
      const invalidIsoCodes = countries.filter(country => !containsIsoCode(country));

      // country list must contains at least one element
      if (_.isArray(countries) && _.isEmpty(countries)) {
        messages.errors.push(`${key}.country is empty`);
      }

      // must be a valid ISO 3166 code
      else if (_.isArray(invalidIsoCodes) && !_.isEmpty(invalidIsoCodes)) {
        invalidIsoCodes.forEach(country => messages.errors.push(country + ' is not a valid ISO2/ISO3 country code'));
      }

      // valid ISO 3166 country code, set alpha3 code on 'clean.boundary.country'
      else {
        // the only way for boundary.country to be assigned is if input is
        //  a string and a known ISO2 or ISO3
        clean[`${key}.country`] = countries.map(country => iso3166.iso3Code(country));
      }
    }
  }

  return messages;
};

function containsIsoCode(isoCode) {
  return iso3166.isISO2Code(isoCode) || iso3166.isISO3Code(isoCode);
}

function _expected(key) {
  return () => [{ name: `${key}.country` }];
}

module.exports = (key = 'boundary') => ({
  sanitize: _sanitize(key),
  expected: _expected(key)
});
