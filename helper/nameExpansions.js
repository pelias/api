
var flipNumberAndStreetCountries = require('./flipNumberAndStreetCountries');
var geolib = require('geolib');
var _ = require('lodash');

var translations = {};
var api = require('pelias-config').generate().api;
var localization = api.localization;
if (localization) {
  if (localization.translations) {
    translations = require(localization.translations);
  }
}

function translate(lang, key, text) {
  if( lang && translations[lang] && translations[lang][key] && translations[lang][key][text] ) {
    return translations[lang][key][text];
  }
  return text;
}

/* Sometimes a venue has several street addresses (e.g. a large department store).
 * Expand names by adding addresses when applicable.
 */
function expandByAddress(docs) {
  var names = [];

  docs.forEach(function(doc) {
    var name;
    if(doc.street) {
      var addr = doc.street;
      if(doc.number) {
        if(_.includes(flipNumberAndStreetCountries, doc.country_a)) {
          addr = addr + ' ' + doc.number;
        } else {
          addr = doc.number + ' ' + addr;
        }
      }
      if(doc.name !== addr) {
        // expand by adding address to the place name
        name = doc.name + ', ' + addr;
      }
    }
    if(name) {
      names.push(name);
    } else {
      names.push(doc.name);
    }
  });
  return names;
}

function expandByLayer(docs, lang) {
  var names = [];

  docs.forEach(function(doc) {
    names.push(doc.name + '(' + doc.layer + ')');
  });
  return names;
}


/* Assign a geographic qualifier such as 'north', 'center' etc.
 * this is a bit complicated because the the place should have the assigned
 * quality in a clear and intuitive manner. For example, it is often
 * not obvious if any of the places can be claimed to be in the center. Like here:
 *                *
 *            *        *
 *              *     *
 *          *
 *             *          *
 *                *
 */

function expandByLocation(docs, lang) {
  var east, west, north, south, _east, _west, _north, _south;
  var names =[];

  // initialize with default names
  docs.forEach(function(doc) {
    names.push(doc.name);
  });

  docs.forEach(function(doc) {
   if(!east) {
     east=west=north=south=_east=_west=_north=_south=doc;
   } else {
     if(doc.lon<west.lon) {
       _west=west; // second best
       west=doc;
     }
     if(doc.lon>east.lon) {
       _east=east;
       east=doc;
     }
     if(doc.lat<south.lat) {
       _south=south;
       south=doc;
     }
     if(doc.lat>north.lat) {
       _north=north;
       north=doc;
     }
   }
  });
  var latDiff = north.center_point.lat - south.center_point.lat;
  var lonDiff = east.center_point.lat - south.center_point.lat;

  // simple logic will not work near places where the wgs84 angle space wraps
  // these are sparsely populated areas so just skip this extension there
  // instead of doing more complex cyclic math with angles
  if(east.lon>175 || west.lon<-175 || north.lat>85 || south.lat<-85 || lonDiff>5 || latDiff>5) {
    return names;
  }

  var geoDist = function(p1, p2) {
    var g1 = { latitude: p1.lat, longitude: p1.lon }; // geolib wants different names
    var g2 = { latitude: p2.lat, longitude: p2.lon };
    return geolib.getDistance( g1, g2 ); // meters
  };

  // don't assign a qualifier like 'north' unless the place has that distinctive property
  // both in relative and absolute scale
  var overThreshold = function(p1, p2, limit, field) {
    if(Math.abs(p1[field] - p2[field]) > limit) { // exceeds relative threshold
      return (geoDist(p1, p2)>50); // exceeds absolute threshold in meters
    }
    return false;
  };

  var expandName = function(doc, label) {
    var i = docs.indexOf(doc);
    label = translate(lang, 'geographic', label);
    names[i] = names[i] + ', ' + label;
  };

  if(overThreshold(north, _north, latDiff * 0.1, 'lat')) {
    expandName(north, 'north');
  }
  if(overThreshold(south, _south, latDiff * 0.1, 'lat')) {
    expandName(south, 'south');
  }
  if(overThreshold(east, _east, lonDiff * 0.1, 'lon')) {
    expandName(east, 'east');
  }
  if(overThreshold(west, _west, lonDiff * 0.1, 'lon')) {
    expandName(west, 'west');
  }

  var center = { lon: 0.5*(east.lon + west.lon), lat: 0.5*(north.lat + south.lat) };
  var middle, _middle;
  var nearestDist;

  docs.forEach(function(doc) { // find place closest to the center
    var dist = geoDist(center, doc.center_point);
    if(!middle) {
      middle = _middle = doc;
      nearestDist = dist;
    } else {
      if(dist<nearestDist) {
        _middle=middle; // second best
        middle=doc;
      }
    }
  });

  // A place labeled as 'center' cannot be very close to northest etc. extreme places. Use a reasonable
  // relative threshold 0.2 (20% of the whole diameter of the place collection) to accept the center.
  if(overThreshold(north.center_point, middle.center_point, latDiff * 0.2, 'lat') &&
     overThreshold(south.center_point, middle.center_point, latDiff * 0.2, 'lat') &&
     overThreshold(east.center_point, middle.center_point, lonDiff * 0.2, 'lon') &&
     overThreshold(west.center_point, middle.center_point, lonDiff * 0.2, 'lon')) {
    var dlon = Math.abs(middle.center_point.lon - center.lon);
    var _dlon = Math.abs(_middle.center_point.lon - center.lon);
    var dlat = Math.abs(middle.center_point.lat - center.lat);
    var _dlat = Math.abs(_middle.center_point.lat - center.lat);

    // Don't assign center qualifier if there's another place almost equally close to the center.
    if(_dlon - dlon > 0.1*lonDiff && _dlat - dlat > 0.1*latDiff) {
      expandName(middle, 'center');
    }
  }
  return names;
}

function expandByCategory(docs, lang) {
  var names = [];
  var categoryTranslations;

  if(lang && translations[lang]) {
    categoryTranslations = translations[lang].category;
  }

  docs.forEach(function(doc) {
    var name;
    if(doc.categories) {
      var extensions = [];
      doc.categories.forEach(function(category) {
        for(var cat in categoryTranslations) { // use translation defined terms if available
          if(category.search(cat) !== -1) { // partial match, for example 'food' in 'food:chinese'
            category = categoryTranslations[cat];
          }
        }
        extensions.push(translate(lang, 'category', category));
      });
      if(extensions.length) {
        name = doc.name + ', ' + extensions.join();
      }
    }
    if(name) {
      names.push(name);
    } else {
      names.push(doc.name);
    }
  });
  return names;
}

module.exports = [expandByAddress, expandByLayer, expandByLocation, expandByCategory];
