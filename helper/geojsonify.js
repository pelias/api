
var GeoJSON = require('geojson'),
    extent = require('geojson-extent'),
    labelGenerator = require('./labelGenerator'),
    logger = require('pelias-logger').get('api'),
    type_mapping = require('./type_mapping'),
    Document = require('pelias-model').Document,
    _ = require('lodash');

// Properties to be copied
// If a property is identified as a single string, assume it should be presented as a string in response
// If something other than string is desired, use the following structure: { name: 'category', type: 'array' }
var DETAILS_PROPS = [
  'housenumber',
  'street',
  'postalcode',
  { name: 'confidence', type: 'default' },
  'distance',
  'country',
  'country_gid',
  'country_a',
  'macroregion',
  'macroregion_gid',
  'macroregion_a',
  'region',
  'region_gid',
  'region_a',
  'macrocounty',
  'macrocounty_gid',
  'macrocounty_a',
  'county',
  'county_gid',
  'county_a',
  'localadmin',
  'localadmin_gid',
  'localadmin_a',
  'locality',
  'locality_gid',
  'locality_a',
  'borough',
  'borough_gid',
  'borough_a',
  'neighbourhood',
  'neighbourhood_gid',
  { name: 'bounding_box', type: 'default' },
  { name: 'category', type: 'array' }
];

function lookupSource(src) {
  return src.source;
}

function lookupSourceId(src) {
  return src.source_id;
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
 * Copy specified properties from source to dest.
 * Ignore missing properties.
 *
 * @param {object} source
 * @param {[]} props
 * @param {object} dst
 */
function copyProperties( source, props, dst ) {
  props.forEach( function ( prop ) {

    var property = {
      name: prop.name || prop,
      type: prop.type || 'string'
    };

    var value = null;
    if ( source.hasOwnProperty( property.name ) ) {

      switch (property.type) {
        case 'string':
          value = getStringValue(source[property.name]);
          break;
        case 'array':
          value = getArrayValue(source[property.name]);
          break;
        // default behavior is to copy property exactly as is
        default:
          value = source[property.name];
      }

      if (_.isNumber(value) || (value && !_.isEmpty(value))) {
        dst[property.name] = value;
      }
    }
  });
}

function getStringValue(property) {
  // isEmpty check works for all types of values: strings, arrays, objects
  if (_.isEmpty(property)) {
    return '';
  }

  if (_.isString(property)) {
    return property;
  }

  // array value, take first item in array (at this time only used for admin values)
  if (_.isArray(property)) {
    return property[0];
  }

  return _.toString(property);
}


function getArrayValue(property) {
  // isEmpty check works for all types of values: strings, arrays, objects
  if (_.isEmpty(property)) {
    return '';
  }

  if (_.isArray(property)) {
    return property;
  }

  return [property];
}

/**
 * Create a gid from a document
 * @TODO modify all importers to create separate source and layer fields to remove mapping
 *
 * @param {object} src
 */
function makeGid(src) {
  var doc = new Document(lookupSource(src), lookupLayer(src), src._id);
  return doc.getGid();
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
  dst.source_id = lookupSourceId(src);
  if (src.hasOwnProperty('bounding_box')) {
    dst.bounding_box = src.bounding_box;
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


module.exports.search = geojsonifyPlaces;
