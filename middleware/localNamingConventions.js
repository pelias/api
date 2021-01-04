const _ = require('lodash');
const field = require('../helper/fieldValue');

var flipNumberAndStreetCountries = [
  /* from the ID Editor config */
  /* https://github.com/openstreetmap/iD/blob/master/data/address-formats.json */
  'AUT' /* Austria */,
  'CHE' /* Switzerland */,
  'DEU' /* Germany */,
  'SVN' /* Slovenia */ ,
  'POL' /* Poland */,
  'AND' /* Andorra */,
  'BIH' /* Bosnia and Herzegovina */,
  'BEL' /* Belgium */,
  'CZE' /* Czechia */,
  'DNK' /* Denmark */,
  'ESP' /* Spain */,
  'FIN' /* Finland */,
  'GRC' /* Greece */,
  'HRV' /* Croatia */,
  'ISL' /* Iceland */,
  'ITA' /* Italy */,
  'LIE' /* Liechtenstein */,
  'NLD' /* Netherlands */,
  'NOR' /* Norway */,
  'PRT' /* Portugal */,
  'SWE' /* Sweden */,
  'SVK' /* Slovakia */,
  'SMR' /* San Marino */,
  'VAT' /* Holy See */,
  'BRA' /* Brazil */,
  'TWN' /* Taiwan */,
  'TUR' /* Turkey */,

  /* Additional country codes not provided by ID Editor config */
  'ROU' /* Romania */,
  'MDA' /* Moldova */,
  'COL' /* Colombia */,
  'HUN' /* Hungary */
];

function setup() {
  var api = require('pelias-config').generate().api;
  var settings = api.localization;
  if (settings && settings.flipNumberAndStreetCountries) {
    var countries = settings.flipNumberAndStreetCountries;
    flipNumberAndStreetCountries = _.uniq(flipNumberAndStreetCountries.concat(countries));
  }

  return applyLocalNamingConventions;
}

function applyLocalNamingConventions(req, res, next) {

  // do nothing if no result data set
  if (!res || !res.data) {
    return next();
  }

  // loop through data items and flip relevant number/street
  res.data.filter(function(place){
    // do nothing for records with no admin info
    if (!_.has(place, 'parent.country_a')) { return false; }

    // relevant for some countries
    const flip = place.parent.country_a.some(country => {
      return _.includes(flipNumberAndStreetCountries, country);
    });
    if (!flip){ return false; }
    if (!_.has(place, 'address_parts.number')) { return false; }
    if (!_.has(place, 'address_parts.street')) { return false; }

    return true;
  })
  .forEach( flipNumberAndStreet );

  next();
}

// flip the housenumber and street name
// eg. '101 Grolmanstraße' -> 'Grolmanstraße 101'
function flipNumberAndStreet(place) {
  const number = field.getStringValue(_.get(place, 'address_parts.number'));
  const street = field.getStringValue(_.get(place, 'address_parts.street'));
  const name = field.getStringValue(_.get(place, 'name.default'));

  // flip street name and housenumber
  if (name === `${number} ${street}`) {
    place.name.default = `${street} ${number}`;
  }
}

module.exports = setup;
