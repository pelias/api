var check = require('check-types');

var flipNumberAndStreetCountries = ['DEU', 'FIN', 'SWE', 'NOR', 'DNK', 'ISL'];

function setup() {
  var api = require('pelias-config').generate().api;
  var settings = api.localization;
  if (settings && settings.flipNumberAndStreetCountries) {
    var countries = settings.flipNumberAndStreetCountries;
    for (var i=0; i<countries.length; i++) {
      var country = countries[i];
      if ( flipNumberAndStreetCountries.indexOf(country===-1) ) {
	flipNumberAndStreetCountries.push(country);
      }
    }
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
    // relevant for some countries
    var flip = false;
    for (var i=0; i<place.parent.country_a.length; i++) {
      var country_a = place.parent.country_a[i];
      if( flipNumberAndStreetCountries.indexOf(country_a) !== -1 ) {
	flip = true;
	break;
      }
    }
    if (!flip){ return false; }

    if( place.parent.country_a.indexOf('DEU') === -1 ){ return false; }
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
