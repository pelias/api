var _ = require('lodash');

var flipNumberAndStreetCountries = ['DEU', 'FIN', 'SWE', 'NOR', 'DNK', 'ISL', 'CZE'];

var api = require('pelias-config').generate().api;
var localization = api.localization;
if (localization) {
  if (localization.flipNumberAndStreetCountries) {
    var countries = localization.flipNumberAndStreetCountries;
    flipNumberAndStreetCountries = _.uniq(flipNumberAndStreetCountries.concat(countries));
  }
}

module.exports = flipNumberAndStreetCountries;
