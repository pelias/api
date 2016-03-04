
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
  'country_a',
  'country',
  'region',
  'region_a',
  'county',
  'localadmin',
  'locality',
  'neighbourhood',
  'confidence',
  'distance'
];


function lookupSource(src) {
  return src.source;
}

function lookupLayer(src) {
  return src.layer;
}

function geojsonifyPlaces( docs ){

  // flatten & expand data for geojson conversion
  var geodata = docs
    .map(geojsonifyPlace)
    .filter( function( doc ){
      return !!doc;
    });

  // convert to geojson
  var geojson = GeoJSON.parse( geodata, { Point: ['lat', 'lng'] });

  // bounding box calculations
  computeBBox(geojson);

  return geojson;
}

function geojsonifyPlace(place) {

  // something went very wrong
  if( !place || !place.hasOwnProperty( 'center_point' ) ) {
    return warning('No doc or center_point property');
  }

  var output = {};

  addMetaData(place, output);
  addDetails(place, output);
  addLabel(place, output);


  // map center_point for GeoJSON to work properly
  // these should not show up in the final feature properties
  output.lat = parseFloat(place.center_point.lat);
  output.lng = parseFloat(place.center_point.lon);

  return output;
}

/**
 * Add details properties
 *
 * @param {object} src
 * @param {object} dst
 */
function addDetails(src, dst) {
  // map name
  if( !src.name || !src.name.default ) { return warning(src); }
  dst.name = src.name.default;

  copyProperties(src, DETAILS_PROPS, dst);
}

/**
 * Add region-specific label string
 *
 * @param {object} src
 * @param {object} dst
 */
function addLabel(src, dst) {
  dst.label = labelGenerator(src);
}

/**
 * Compute bbox that encompasses all features in the result set.
 * Set bbox property on the geojson object.
 *
 * @param {object} geojson
 */
function computeBBox(geojson) {
  // @note: extent() sometimes throws Errors for unusual data
  // eg: https://github.com/pelias/pelias/issues/84
  try {
    var bbox = extent( geojson );
    if( !!bbox ){
      geojson.bbox = bbox;
    }
  } catch( e ){
    console.error( 'bbox error', e.message, e.stack );
    console.error( 'geojson', JSON.stringify( geojson, null, 2 ) );
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
      dst[prop] = source[prop];
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
