
var GeoJSON = require('geojson');
var extent = require('geojson-extent');
var labelGenerator = require('./labelGenerator');
var logger = require('pelias-logger').get('api');
var type_mapping = require('./type_mapping');
var _ = require('lodash');
var addDetails = require('./geojsonify_place_details');
var addMetaData = require('./geojsonify_meta_data');

function geojsonifyPlaces( params, docs ){

  // flatten & expand data for geojson conversion
  var geodata = docs
    .map(geojsonifyPlace.bind(null, params))
    .filter( function( doc ){
      return !!doc;
    });

  // get all the bounding_box corners as well as single points
  // to be used for computing the overall bounding_box for the FeatureCollection
  var extentPoints = extractExtentPoints(geodata);

  // convert to geojson
  var geojson             = GeoJSON.parse( geodata, { Point: ['lat', 'lng'] });
  var geojsonExtentPoints = GeoJSON.parse( extentPoints, { Point: ['lat', 'lng'] });

  // to insert the bbox property at the top level of each feature, it must be done separately after
  // initial geojson construction is finished
  addBBoxPerFeature(geojson);

  // bounding box calculations
  computeBBox(geojson, geojsonExtentPoints);

  return geojson;
}

function geojsonifyPlace(params, place) {

  // something went very wrong
  if( !place || !place.hasOwnProperty( 'center_point' ) ) {
    return warning('No doc or center_point property');
  }

  var output = {};

  addMetaData(place, output);
  addName(place, output);
  addDetails(params, place, output);
  addLabel(place, output);


  // map center_point for GeoJSON to work properly
  // these should not show up in the final feature properties
  output.lat = parseFloat(place.center_point.lat);
  output.lng = parseFloat(place.center_point.lon);

  return output;
}

/**
 * Validate and add name property
 *
 * @param {object} src
 * @param {object} dst
 */
function addName(src, dst) {
  // map name
  if( !src.name || !src.name.default ) { return warning(src); }
  dst.name = src.name.default;
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
 * Add bounding box
 *
 * @param {object} geojson
 */
function addBBoxPerFeature(geojson) {
  geojson.features.forEach(function (feature) {

    if (!feature.properties.hasOwnProperty('bounding_box')) {
      return;
    }

    if (feature.properties.bounding_box) {
      feature.bbox = [
        feature.properties.bounding_box.min_lon,
        feature.properties.bounding_box.min_lat,
        feature.properties.bounding_box.max_lon,
        feature.properties.bounding_box.max_lat
      ];
    }

    delete feature.properties.bounding_box;
  });
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
 * emit a warning if the doc format is invalid
 *
 * @note: if you see this error, fix it ASAP!
 */
function warning( doc ) {
  console.error( 'error: invalid doc', __filename, doc);
  return false; // remove offending doc from results
}


module.exports = geojsonifyPlaces;
