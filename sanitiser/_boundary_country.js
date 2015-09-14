var isObject = require('is-object');
var iso3166 = require('iso3166-1');

function sanitize(raw, clean) {
  // error & warning messages
  var messages = { errors: [], warnings: [] };

  // init clean.boundary (if not already init)
  clean.boundary = clean.boundary || {};

  if (raw.boundary && raw.boundary.country) {
    var country = raw.boundary.country

    if (typeof country !== 'string') {
      messages.warnings.push('boundary.country is not a string');
      clean.boundary.country = undefined;
    }
    else if (!containsIsoCode(country.toUpperCase())) {
      messages.warnings.push(country + ' is not a valid ISO2/ISO3 country code');
      clean.boundary.country = undefined;
    }
    else {
      clean.boundary.country = iso3166.to2(country.toUpperCase());
    }

  } else {
    clean.boundary.country = undefined;
  }

  return messages;

}

function containsIsoCode(isoCode) {
  return iso3166.list().filter(function(row) {
      return row.alpha2 === isoCode || row.alpha3 === isoCode;
  }).length > 0;
}

module.exports = sanitize;
