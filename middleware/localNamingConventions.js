
var check = require('check-types');
var _ = require('lodash');
var logger = require('pelias-logger').get('api:middleware:localNamingConventions');

var flipNumberAndStreetCountries = ['DEU', 'FIN', 'SWE', 'NOR', 'DNK', 'ISL'];
var translations = {};

function setup() {
  var api = require('pelias-config').generate().api;
  var localization = api.localization;
  if (localization) {
    if (localization.flipNumberAndStreetCountries) {
      var countries = localization.flipNumberAndStreetCountries;
      flipNumberAndStreetCountries = _.uniq(flipNumberAndStreetCountries.concat(countries));
    }
    if (localization.translations) {
      translations = localization.translations;
    }
  }
  return applyLocalNamingConventions;
}

function applyLocalNamingConventions(req, res, next) {

  // do nothing if no result data set
  if (!res || !res.data) {
    return next();
  }

  logger.debug('============ request.clean', req.clean);

  // loop through data items and flip relevant number/street
  res.data.filter(function(place){
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

  if( req.lang && translations[req.lang] ) {
    _.forEach(translations[req.lang], function(names, key) {
      _.forEach(res.data, function(place) {
	if( place[key] !== null ) {
	  var name;
	  if (place[key] instanceof Array) {
	    name = place[key][0];
	    if (name && names[name]) {
	      place[key][0] = names[name]; // do the translation
	    }
	  } else {
	    name = place[key];
	    if (name && names[name]) {
	      place[key] = names[name];
	    }
	  }
	}
      });
    });
  }
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
