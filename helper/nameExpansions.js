var flipNumberAndStreetCountries = require('./flipNumberAndStreetCountries');
var geolib = require('geolib');
var _ = require('lodash');
var logger = require('pelias-logger').get('api:nameExpansions');

var adminExpansions=['neighbourhood', 'locality'];
var translations = {};

var api = require('pelias-config').generate().api;
var localization = api.localization;
if (localization) {
  if (localization.translations) {
    translations = require(localization.translations);
  }
  if (localization.adminExpansions) {
    adminExpansions=localization.adminExpansions;
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
      if(doc.housenumber) {
        if(_.includes(flipNumberAndStreetCountries, doc.country_a[0])) {
          addr = addr + ' ' + doc.housenumber;
        } else {
          addr = doc.housenumber + ' ' + addr;
        }
      }
      if(doc.name.toLowerCase() !== addr.toLowerCase()) {
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

/*
 * Expand names by adding more parent admin info
 */
function expandByAdmin(docs) {
  var names = [];

  docs.forEach(function(doc) {
    var name;
    for (var i=0; i<adminExpansions.length; i++) {
      var exp = doc[adminExpansions[i]];
      if (exp && doc.label.search(exp)===-1) {
        name = doc.name + ', ' + exp;
        break;
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
    names.push(doc.name + ' (' + translate(lang, '__layer', doc.layer) + ')');
  });
  return names;
}


/* Assign a geographic qualifier such as 'north', 'center' etc.
 * this is a bit complicated because the the place should have the assigned
 * quality in a clear and intuitive manner. For example, it is often
 * not obvious if any of the places can be claimed to be in the center. Like here:
 *                *
 *            *        *
 *             *     *
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
  if(docs.length<2) { // Sanitize. Comparisons below will fail for a single doc
    return;
  }

  docs.forEach(function(doc) {
    if(!east) {
      east=west=north=south=doc;
    } else {
      if(doc.center_point.lon<west.center_point.lon) {
        _west=west;
        west=doc;
      } else if(!_west || doc.center_point.lon<_west.center_point.lon) {
        _west=doc;  // second westmost
      }
      if(doc.center_point.lon>east.center_point.lon) {
        _east=east;
        east=doc;
      } else if(!_east || doc.center_point.lon>_east.center_point.lon) {
        _east=doc;
      }
      if(doc.center_point.lat<south.center_point.lat) {
        _south=south;
        south=doc;
      } else if(!_south || doc.center_point.lat<_south.center_point.lat) {
        _south=doc;
      }
      if(doc.center_point.lat>north.center_point.lat) {
        _north=north;
        north=doc;
      } else if(!_north || doc.center_point.lat>_north.center_point.lat) {
        _north=doc;
      }
    }
  });
  var latDiff = north.center_point.lat - south.center_point.lat;
  var lonDiff = east.center_point.lat - west.center_point.lat;

  // simple logic will not work near places where the wgs84 angle space wraps
  // these are sparsely populated areas so just skip this extension there
  // instead of doing more complex cyclic math with angles
  if(east.center_point.lon>175 || west.center_point.lon<-175 ||
     north.center_point.lat>85 || south.center_point.lat<-85 || lonDiff>5 || latDiff>5) {
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
    label = translate(lang, '__geographic', label);
    names[i] = names[i] + ', ' + label;
  };

  if(overThreshold(north.center_point, _north.center_point, latDiff * 0.1, 'lat')) {
    if(north===west) {
      expandName(north, 'northwest');
    } else if(north===east) {
      expandName(north, 'northeast');
    }
    else {
      expandName(north, 'north');
    }
  }
  if(overThreshold(south.center_point, _south.center_point, latDiff * 0.1, 'lat')) {
    if(south===west) {
      expandName(south, 'southwest');
    } else if(south===east) {
      expandName(south, 'southeast');
    }
    else {
      expandName(south, 'south');
    }
  }
  if(overThreshold(east.center_point, _east.center_point, lonDiff * 0.1, 'lon')) {
    if(south!==east && north!==east) { // not yet labeled
      expandName(east, 'east');
    }
  }
  if(overThreshold(west.center_point, _west.center_point, lonDiff * 0.1, 'lon')) {
    if(south!==west && north!==west) {
      expandName(west, 'west');
    }
  }

  var center = {
    lon: 0.5*(east.center_point.lon + west.center_point.lon),
    lat: 0.5*(north.center_point.lat + south.center_point.lat)
  };

  var middle, _middle;
  var nearestDist, _nearestDist;

  docs.forEach(function(doc) { // find place closest to the center
    var dist = geoDist(center, doc.center_point);
    if(!middle) {
      middle = doc;
      nearestDist = dist;
    } else {
      if(dist<nearestDist) {
        _middle=middle;
        _nearestDist=nearestDist;
        middle=doc;
        nearestDist=dist;
      } else if(!_middle || dist<_nearestDist) {
        _middle=doc;
        _nearestDist=dist;
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
      expandName(middle, 'central');
    }
  }
  return names;
}

function expandByCategory(docs, lang) {
  var names = [];
  var categoryTranslations;

  if(lang && translations[lang]) {
    categoryTranslations = translations[lang].__category;
  }

  docs.forEach(function(doc) {
    var name;
    if(doc.category) {
      var extensions = [];
      doc.category.forEach(function(category) {
        for(var cat in categoryTranslations) { // use translation defined terms if available
          if(category.search(cat) !== -1) { // partial match, for example 'food' in 'food:chinese'
            category = categoryTranslations[cat];
          }
        }
        if(extensions.indexOf(category) === -1) { // not yet added
          extensions.push(category);
        }
      });
      if(extensions.length) {
        name = doc.name + ' (' + extensions.join() + ')';
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

var expansionLib = { expandByAddress: expandByAddress,
                     expandByAdmin: expandByAdmin,
                     expandByLayer: expandByLayer,
                     expandByLocation: expandByLocation,
                     expandByCategory: expandByCategory
                   };

var expansions;

if (localization && localization.expansions) { // configure custom list
  expansions = [];
  localization.expansions.forEach(function(expansion) {
    expansions.push(expansionLib(expansion)); // map name to func
  });
} else {
  expansions = [expandByAddress, expandByAdmin, expandByCategory, expandByLocation];
}

module.exports = expansions;
