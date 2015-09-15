var check = require('check-types');
var iso3166 = require('iso3166-1');

function sanitize(raw, clean) {
  // error & warning messages
  var messages = { errors: [], warnings: [] };

  // init clean.boundary (if not already init)
  clean.boundary = clean.boundary || {};

  if (check.assigned(raw['boundary.country'])) {
    var country = raw['boundary.country'];

    if (!check.string(country)) {
      messages.warnings.push('boundary.country is not a string');
      delete clean.boundary.country;
    }
    else if (!containsIsoCode(country.toUpperCase())) {
      messages.warnings.push(country + ' is not a valid ISO2/ISO3 country code');
      delete clean.boundary.country;
    }
    else {
      // the only way for boundary.country to be assigned is if input is
      //  a string and a known ISO2 or ISO3
      clean.boundary.country = iso3166.to3(country.toUpperCase());
    }

  } else {
    delete clean.boundary.country;
  }

  return messages;

}

function containsIsoCode(isoCode) {
  return iso3166.list().some(function(row) {
      return row.alpha2 === isoCode || row.alpha3 === isoCode;
  });
}

module.exports = sanitize;
