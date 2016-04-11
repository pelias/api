
var GeoJSON = require('geojson'),
    extent = require('geojson-extent'),
    labelGenerator = require('./labelGenerator'),
    logger = require('pelias-logger').get('api'),
    type_mapping = require('./type_mapping'),
    _ = require('lodash');

// Properties to be copied
var DETAILS_PROPS = [
  'housenumber',
  'street',
  'postalcode',
  'confidence',
  'distance',
  'country',
  'country_id',
  'country_a',
  'macroregion',
  'macroregion_id',
  'macroregion_a',
  'region',
  'region_id',
  'region_a',
  'macrocounty',
  'macrocounty_id',
  'macrocounty_a',
  'county',
  'county_id',
  'county_a',
  'localadmin',
  'localadmin_id',
  'localadmin_a',
  'locality',
  'locality_id',
  'locality_a',
  'neighbourhood',
  'neighbourhood_id',
  'bounding_box'
];


function lookupSource(src) {
  return src.source;
}

function lookupLayer(src) {
  return src.layer;
}

function geojsonifyPlaces( docs, lang ){
  var geojsonifyPlace = function (place) {
    // something went very wrong
    if( !place || !place.hasOwnProperty( 'center_point' ) ) {
      return warning('No doc or center_point property');
    }

    var output = {};

    addMetaData(place, output);
    addDetails(place, output, lang);
    addLabel(place, output);

    // map center_point for GeoJSON to work properly
    // these should not show up in the final feature properties
    output.lat = parseFloat(place.center_point.lat);
    output.lng = parseFloat(place.center_point.lon);

    return output;
  };

  // flatten & expand data for geojson conversion
  var geodata = docs
    .map(geojsonifyPlace)
    .filter( function( doc ){
      return !!doc;
    });

  // get all the bounding_box corners as well as single points
  // to be used for computing the overall bounding_box for the FeatureCollection
  var extentPoints = extractExtentPoints(geodata);

  // convert to geojson
  var geojson             = GeoJSON.parse( geodata, { Point: ['lat', 'lng'] });
  var geojsonExtentPoints = GeoJSON.parse( extentPoints, { Point: ['lat', 'lng'] });

  // bounding box calculations
  computeBBox(geojson, geojsonExtentPoints);

  return geojson;
}

/**
 * Add details properties
 *
 * @param {object} src
 * @param {object} dst
 * @param {string} lang
 */
function addDetails(src, dst, lang) {
  // map name
  if( !src.name ) { return warning(src); }

  if( src.name[lang] ) {
    dst.name = src.name[lang];
  } else if (src.name.default) { // fallback
    dst.name = src.name.default;
  } else {
    return warning(src);
  }
  copyProperties(src, DETAILS_PROPS, dst);
}

/**
 * Add region-specific label string
 *
 * @param {object} src
 * @param {object} dst
 */
function addLabel(src, dst) {
  dst.label = labelGenerator(dst);
}


/**
 * Collect all points from the geodata.
 * If an item is a single point, just use that.
 * If an item has a bounding box, add two corners of the box as individual points.
 *
 * @param {Array} geodata
 * @returns {Array}
 */
function extractExtentPoints(geodata) {
  var extentPoints = [];
  geodata.forEach(function (place) {
    if (place.bounding_box) {
      extentPoints.push({
        lng: place.bounding_box.min_lon,
        lat: place.bounding_box.min_lat
      });
      extentPoints.push({
        lng: place.bounding_box.max_lon,
        lat: place.bounding_box.max_lat
      });
    }
    else {
      extentPoints.push({
        lng: place.lng,
        lat: place.lat
      });
    }
  });

  return extentPoints;
}

/**
 * Compute bbox that encompasses all features in the result set.
 * Set bbox property on the geojson object.
 *
 * @param {object} geojson
 */
function computeBBox(geojson, geojsonExtentPoints) {
  // @note: extent() sometimes throws Errors for unusual data
  // eg: https://github.com/pelias/pelias/issues/84
  try {
    var bbox = extent( geojsonExtentPoints );
    if( !!bbox ){
      geojson.bbox = bbox;
    }
  } catch( e ){
    console.error( 'bbox error', e.message, e.stack );
    console.error( 'geojson', JSON.stringify( geojsonExtentPoints, null, 2 ) );
  }
}

/**
 * Copy specified properties from source to dest.
 * Ignore missing properties.
 *
 * @param {object} source
 * @param {[]} props
 * @param {object} dst
 */
function copyProperties( source, props, dst ) {
  props.forEach( function ( prop ) {

    if ( source.hasOwnProperty( prop ) ) {

      // array value, take first item in array (at this time only used for admin values)
      if (source[prop] instanceof Array) {
	if (source[prop].length === 0) {
	  return;
	}
	if (source[prop][0]) {
	  dst[prop] = source[prop][0];
	}
      }

      // simple value
      else {
	dst[prop] = source[prop];
      }
    }
  });
}

/**
 * Create a gid from a document
 * @TODO modify all importers to create separate source and layer fields to remove mapping
 *
 * @param {object} src
 */
function makeGid(src) {
  return lookupSource(src) + ':' + lookupLayer(src) + ':' + src._id;
}

/**
 * Determine and set place id, type, and source
 *
 * @param {object} src
 * @param {object} dst
 */
function addMetaData(src, dst) {
  dst.id = src._id;
  dst.gid = makeGid(src);
  dst.layer = lookupLayer(src);
  dst.source = lookupSource(src);
}

/**
 * emit a warning if the doc format is invalid
 *
 * @note: if you see this error, fix it ASAP!
 */
function warning( doc ) {
  console.error( 'error: invalid doc', __filename, doc);
  return false; // remove offending doc from results
}


module.exports.search = geojsonifyPlaces;
