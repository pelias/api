
var check = require('check-types');
var _ = require('lodash');
var logger = require('pelias-logger').get('api:middleware:translate');

var translations = {};

function setup() {
  var api = require('pelias-config').generate().api;
  var localization = api.localization;
  if (localization) {
    if (localization.translations) {
      translations = require(localization.translations);
    }
  }
  return translate;
}

function translate(req, res, next) {

  // do nothing if no result data set
  if (!res || !res.data) {
    return next();
  }

  var lang, matched;
  if (req.clean) {
    lang = req.clean.lang;
    matched =  req.clean.matched;
  }

  if( lang && translations[lang] ) {
    _.forEach(translations[lang], function(names, key) {
      _.forEach(res.data, function(place) {
        translateProperties(place, key, names);
        translateProperties(place.parent, key, names);
        if(place.address_parts) {
          translateProperties(place.address_parts, key, names);
        }
      });
    });
  }

  _.forEach(res.data, function(place) {
    translateName(place, lang, matched);
  });

  next();
}

function translateName(place, lang, matched) {
  if( place.name ) {
    if( matched && place.name[matched] ) {
      // store also name version which gave best match
      place.altName = place.name[matched];
    }
    if( place.name[lang] ) {
      place.name = place.name[lang];
    } else if (place.name.default) { // fallback
      place.name = place.name.default;
    }
  }
}


function translateProperties(place, key, names) {
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

module.exports = setup;
