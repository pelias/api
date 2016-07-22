var check = require('check-types');
var _ = require('lodash');

var flipNumberAndStreetCountries = ['DEU', 'FIN', 'SWE', 'NOR', 'DNK', 'ISL', 'CZE'];

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
    if (!place.parent || !place.parent.country_a) { return false; }

    // relevant for some countries
    var flip = place.parent.country_a.some(function(country) {
      return _.includes(flipNumberAndStreetCountries, country);
    });
    if (!flip){ return false; }
    if( !place.hasOwnProperty('address_parts') ){ return false; }
    if( !place.address_parts.hasOwnProperty('number') ){ return false; }
    if( !place.address_parts.hasOwnProperty('street') ){ return false; }

    return true;
  })
  .forEach( flipNumberAndStreet );

  next();
}

// flip the housenumber and street name
// eg. '101 Grolmanstraße' -> 'Grolmanstraße 101'
function flipNumberAndStreet(place) {
  var standard = ( place.address_parts.number + ' ' + place.address_parts.street ),
      flipped  = ( place.address_parts.street + ' ' + place.address_parts.number );

  // flip street name and housenumber
  if( place.name.default === standard ){
    place.name.default = flipped;
  }
}

module.exports = setup;
