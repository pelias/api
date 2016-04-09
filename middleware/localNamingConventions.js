var iterate = require('../helper/iterate');
var check = require('check-types');
var _ = require('lodash');

var flipNumberAndStreetCountries = ['DEU', 'FIN', 'SWE', 'NOR', 'DNK', 'ISL'];

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

  if (!res) {
    return next();
  }

  iterate(res.results, function(result) {
    // do nothing if no result data set
    if(_.isUndefined(result) || _.isUndefined(result.data)) { return; }

    // loop through data items and flip relevant number/street
    result.data.filter(function(place){
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
  });

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
