
var check = require('check-types');
var _ = require('lodash');
var logger = require('pelias-logger').get('api:middleware:localNamingConventions');

var flipNumberAndStreetCountries = ['DEU', 'FIN', 'SWE', 'NOR', 'DNK', 'ISL', 'CZE'];
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
      translations = require(localization.translations);
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

  var lang;
  if (req.clean) {
    lang = req.clean.lang;
  }

  if( lang && translations[lang] ) {
    _.forEach(translations[lang], function(names, key) {
      _.forEach(res.data, function(place) {
        translateName(place, key, names);
        translateName(place.parent, key, names);
      });
    });
  }
  next();
}


function translateName(place, key, names) {
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
}


// flip the housenumber and street name
// eg. '101 Grolmanstraße' -> 'Grolmanstraße 101'
function flipNumberAndStreet(place) {
  var standard = ( place.address_parts.number + ' ' + place.address_parts.street ),
      flipped  = ( place.address_parts.street + ' ' + place.address_parts.number );

  // flip street name and housenumber
  if( place.name.default === standard ){
    place.name.default = flipped;

    // flip also other name versions
    for (var lang in place.name) {
      var name = place.name[lang].replace(place.address_parts.number, '').trim();
      place.name[lang] = name + ' ' + place.address_parts.number;
    }
  }
}

module.exports = setup;
